import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut as fbSignOut, User } from 'firebase/auth';
import { Match, StatEventType, StatEvent, UserProfile } from '../types';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  loadMatchesForUser,
  saveMatchForUser,
  deleteMatchForUser,
  subscribeToMatches,
} from '../utils/cloudStorage';
import { loadMatches, loadProfile, saveProfile } from '../utils/storage';
import { generateId, getElapsedSeconds } from '../utils/calculations';

interface AppContextValue {
  matches: Match[];
  activeMatch: Match | null;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  currentUser: User | null;
  isAuthLoading: boolean;
  userProfile: UserProfile | null;
  createMatch: (opponent: string, competition: string) => Match;
  logEvent: (type: StatEventType) => void;
  undoLastEvent: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endMatch: () => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  getMatchById: (id: string) => Match | undefined;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isFirebaseConfigured());
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uid = currentUser?.uid ?? null;

  useEffect(() => {
    loadProfile().then(setUserProfileState);
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsub;
  }, []);

  // Load matches when auth resolves
  useEffect(() => {
    if (isAuthLoading) return;

    loadMatchesForUser(uid).then((loaded) => {
      setMatches(loaded);
      const active = loaded.find((m) => m.isActive);
      if (active) {
        setActiveMatch(active);
        startTickerFor(active);
      }
    });

    // Subscribe to real-time updates for logged-in users
    if (uid && isFirebaseConfigured()) {
      const unsub = subscribeToMatches(uid, (cloudMatches) => {
        setMatches(cloudMatches);
        const active = cloudMatches.find((m) => m.isActive);
        if (active) setActiveMatch(active);
      });
      return () => {
        unsub();
        stopTicker();
      };
    }
    return () => stopTicker();
  }, [uid, isAuthLoading]);

  const isTimerRunning = activeMatch?.pausedAt === null && activeMatch?.isActive === true;

  function startTickerFor(match: Match) {
    stopTicker();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(match));
    }, 500);
  }

  function stopTicker() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const createMatch = useCallback(
    (opponent: string, competition: string): Match => {
      const now = Date.now();
      const match: Match = {
        id: generateId(),
        opponent,
        competition,
        date: now,
        playtime: 0,
        events: [],
        isActive: true,
        startedAt: now,
        totalPausedMs: 0,
        pausedAt: null,
      };
      setActiveMatch(match);
      saveMatchForUser(match, uid);
      setMatches((prev) => [match, ...prev.filter((m) => m.id !== match.id)]);
      startTickerFor(match);
      return match;
    },
    [uid]
  );

  const logEvent = useCallback(
    (type: StatEventType) => {
      setActiveMatch((prev) => {
        if (!prev) return prev;
        const event: StatEvent = {
          id: generateId(),
          type,
          matchTime: Math.floor(getElapsedSeconds(prev)),
          createdAt: Date.now(),
        };
        const updated = { ...prev, events: [...prev.events, event] };
        saveMatchForUser(updated, uid);
        setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
        startTickerFor(updated);
        return updated;
      });
    },
    [uid]
  );

  const undoLastEvent = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.events.length === 0) return prev;
      const updated = { ...prev, events: prev.events.slice(0, -1) };
      saveMatchForUser(updated, uid);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      return updated;
    });
  }, [uid]);

  const pauseTimer = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.pausedAt !== null) return prev;
      const updated = { ...prev, pausedAt: Date.now() };
      saveMatchForUser(updated, uid);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      stopTicker();
      return updated;
    });
  }, [uid]);

  const resumeTimer = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.pausedAt === null) return prev;
      const extraPaused = Date.now() - prev.pausedAt;
      const updated = {
        ...prev,
        totalPausedMs: prev.totalPausedMs + extraPaused,
        pausedAt: null,
      };
      saveMatchForUser(updated, uid);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      startTickerFor(updated);
      return updated;
    });
  }, [uid]);

  const endMatch = useCallback(async () => {
    setActiveMatch((prev) => {
      if (!prev) return null;
      const playtime = Math.floor(getElapsedSeconds(prev));
      const finished: Match = { ...prev, isActive: false, playtime, pausedAt: null };
      saveMatchForUser(finished, uid);
      setMatches((all) => all.map((m) => (m.id === finished.id ? finished : m)));
      stopTicker();
      return null;
    });
  }, [uid]);

  const deleteMatch = useCallback(
    async (matchId: string) => {
      await deleteMatchForUser(matchId, uid);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    },
    [uid]
  );

  const getMatchById = useCallback(
    (id: string) => matches.find((m) => m.id === id),
    [matches]
  );

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured()) await fbSignOut(auth);
    setMatches([]);
    setActiveMatch(null);
    stopTicker();
  }, []);

  const updateProfile = useCallback(async (profile: UserProfile) => {
    await saveProfile(profile);
    setUserProfileState(profile);
  }, []);

  return (
    <AppContext.Provider
      value={{
        matches,
        activeMatch,
        elapsedSeconds,
        isTimerRunning,
        currentUser,
        isAuthLoading,
        userProfile,
        createMatch,
        logEvent,
        undoLastEvent,
        pauseTimer,
        resumeTimer,
        endMatch,
        deleteMatch,
        getMatchById,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
