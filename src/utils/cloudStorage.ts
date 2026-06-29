/**
 * Cloud storage layer — uses Firestore when Firebase is configured and the
 * user is signed in, falls back to local AsyncStorage transparently.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { loadMatches, saveMatch as localSave, deleteMatch as localDelete } from './storage';
import { Match } from '../types';

function matchesRef(uid: string) {
  return collection(db, 'users', uid, 'matches');
}

export async function loadMatchesForUser(uid: string | null): Promise<Match[]> {
  if (!uid || !isFirebaseConfigured()) return loadMatches();
  try {
    const q = query(matchesRef(uid), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Match);
  } catch {
    return loadMatches();
  }
}

export async function saveMatchForUser(match: Match, uid: string | null): Promise<void> {
  await localSave(match); // always keep local copy
  if (!uid || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(matchesRef(uid), match.id), match);
  } catch {
    // silently fall back — local copy is already saved
  }
}

export async function deleteMatchForUser(matchId: string, uid: string | null): Promise<void> {
  await localDelete(matchId);
  if (!uid || !isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(matchesRef(uid), matchId));
  } catch {
    // ignore — local delete already done
  }
}

export function subscribeToMatches(
  uid: string,
  onUpdate: (matches: Match[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) return () => {};
  const q = query(matchesRef(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => d.data() as Match);
    onUpdate(matches);
  });
}
