import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match } from '../types';

const MATCHES_KEY = '@gkstats_matches';

export async function loadMatches(): Promise<Match[]> {
  try {
    const raw = await AsyncStorage.getItem(MATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Match[];
  } catch {
    return [];
  }
}

export async function saveMatches(matches: Match[]): Promise<void> {
  await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export async function saveMatch(match: Match): Promise<void> {
  const all = await loadMatches();
  const idx = all.findIndex((m) => m.id === match.id);
  if (idx >= 0) {
    all[idx] = match;
  } else {
    all.unshift(match);
  }
  await saveMatches(all);
}

export async function deleteMatch(matchId: string): Promise<void> {
  const all = await loadMatches();
  await saveMatches(all.filter((m) => m.id !== matchId));
}
