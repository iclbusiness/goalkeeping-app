export type StatEventType =
  | 'save'
  | 'goal_conceded'
  | 'pass_success'
  | 'pass_fail'
  | 'clearance'
  | 'punch'
  | 'catch_cross'
  | 'drop'
  | 'yellow_card'
  | 'red_card';

export interface StatEvent {
  id: string;
  type: StatEventType;
  matchTime: number; // seconds into match when event occurred
  createdAt: number; // unix ms timestamp
}

export interface Match {
  id: string;
  opponent: string;
  competition: string;
  date: number; // unix ms timestamp
  playtime: number; // total seconds played (written on end match)
  events: StatEvent[];
  isActive: boolean;
  startedAt: number; // unix ms timestamp when timer first started
  totalPausedMs: number; // accumulated paused milliseconds
  pausedAt: number | null; // ms timestamp when last paused (null = running)
}

export interface ComputedStats {
  totalShots: number;
  saves: number;
  goalsConceded: number;
  savePercentage: number;
  totalPasses: number;
  passesCompleted: number;
  passesFailed: number;
  passCompletionRate: number;
  clearances: number;
  catches: number;
  punches: number;
  drops: number;
  yellowCards: number;
  redCards: number;
  cleanSheet: boolean;
  playerRating: number;
  ratingLabel: string;
  ratingColor: string;
  professionalComparison: string;
  savePercentageBenchmark: string;
  passRateBenchmark: string;
}

// AI Video Analysis — plug Veo or any provider in here when ready
export interface VideoAnalysisOptions {
  playerJerseyColor?: string;
  playerNumber?: number;
  matchDuration?: number;
}

export interface VideoAnalysisResult {
  events: Array<Omit<StatEvent, 'id'>>;
  playtime: number;
  confidence: number;
  provider: string;
  analyzedAt: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Match: { matchId: string };
  MatchSummary: { matchId: string };
  NewMatch: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
};
