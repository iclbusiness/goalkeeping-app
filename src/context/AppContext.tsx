import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Match, StatEventType, StatEvent } from '../types';
import { loadMatches, saveMatch, deleteMatch as deleteMatchFromStorage } from '../utils/storage';
import { generateId, getElapsedSeconds } from '../utils/calculations';

interface AppContextValue {
  matches: Match[];
  activeMatch: Match | null;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  createMatch: (opponent: string, competition: string) => Match;
  logEvent: (type: StatEventType) => void;
  undoLastEvent: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endMatch: () => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  getMatchById: (id: string) => Match | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted matches on mount
  useEffect(() => {
    loadMatches().then((loaded) => {
      setMatches(loaded);
      const active = loaded.find((m) => m.isActive);
      if (active) {
        setActiveMatch(active);
        startTickerFor(active);
      }
    });
    return () => stopTicker();
  }, []);

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

  const createMatch = useCallback((opponent: string, competition: string): Match => {
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
    saveMatch(match);
    setMatches((prev) => [match, ...prev.filter((m) => m.id !== match.id)]);
    startTickerFor(match);
    return match;
  }, []);

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
        saveMatch(updated);
        setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
        startTickerFor(updated);
        return updated;
      });
    },
    []
  );

  const undoLastEvent = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.events.length === 0) return prev;
      const updated = { ...prev, events: prev.events.slice(0, -1) };
      saveMatch(updated);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      return updated;
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.pausedAt !== null) return prev;
      const updated = { ...prev, pausedAt: Date.now() };
      saveMatch(updated);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      stopTicker();
      return updated;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.pausedAt === null) return prev;
      const extraPaused = Date.now() - prev.pausedAt;
      const updated = {
        ...prev,
        totalPausedMs: prev.totalPausedMs + extraPaused,
        pausedAt: null,
      };
      saveMatch(updated);
      setMatches((all) => all.map((m) => (m.id === updated.id ? updated : m)));
      startTickerFor(updated);
      return updated;
    });
  }, []);

  const endMatch = useCallback(async () => {
    setActiveMatch((prev) => {
      if (!prev) return null;
      const playtime = Math.floor(getElapsedSeconds(prev));
      const finished: Match = {
        ...prev,
        isActive: false,
        playtime,
        pausedAt: null,
      };
      saveMatch(finished);
      setMatches((all) => all.map((m) => (m.id === finished.id ? finished : m)));
      stopTicker();
      return null;
    });
  }, []);

  const deleteMatch = useCallback(async (matchId: string) => {
    await deleteMatchFromStorage(matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, []);

  const getMatchById = useCallback(
    (id: string) => matches.find((m) => m.id === id),
    [matches]
  );

  return (
    <AppContext.Provider
      value={{
        matches,
        activeMatch,
        elapsedSeconds,
        isTimerRunning,
        createMatch,
        logEvent,
        undoLastEvent,
        pauseTimer,
        resumeTimer,
        endMatch,
        deleteMatch,
        getMatchById,
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
