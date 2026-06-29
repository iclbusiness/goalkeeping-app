import { StatEvent, ComputedStats } from '../types';

// Professional benchmarks (based on top-flight averages)
const BENCHMARK_SAVE_PCT = 72; // average for professional GKs
const BENCHMARK_PASS_PCT = 68;

function count(events: StatEvent[], type: StatEvent['type']): number {
  return events.filter((e) => e.type === type).length;
}

export function computeStats(events: StatEvent[]): ComputedStats {
  const saves = count(events, 'save');
  const goalsConceded = count(events, 'goal_conceded');
  const passesCompleted = count(events, 'pass_success');
  const passesFailed = count(events, 'pass_fail');
  const clearances = count(events, 'clearance');
  const catches = count(events, 'catch_cross');
  const punches = count(events, 'punch');
  const drops = count(events, 'drop');
  const yellowCards = count(events, 'yellow_card');
  const redCards = count(events, 'red_card');

  const totalShots = saves + goalsConceded;
  const totalPasses = passesCompleted + passesFailed;

  const savePercentage = totalShots > 0 ? (saves / totalShots) * 100 : 0;
  const passCompletionRate = totalPasses > 0 ? (passesCompleted / totalPasses) * 100 : 0;
  const cleanSheet = goalsConceded === 0 && events.length > 0;

  const playerRating = calculateRating({
    saves,
    goalsConceded,
    passesCompleted,
    passesFailed,
    clearances,
    catches,
    punches,
    drops,
    yellowCards,
    redCards,
    cleanSheet,
  });

  const { label: ratingLabel, color: ratingColor, comparison: professionalComparison } = getRatingDescriptors(playerRating);

  const savePercentageBenchmark = getBenchmarkText(savePercentage, BENCHMARK_SAVE_PCT, '%', 'save percentage');
  const passRateBenchmark = getBenchmarkText(passCompletionRate, BENCHMARK_PASS_PCT, '%', 'pass completion');

  return {
    totalShots,
    saves,
    goalsConceded,
    savePercentage,
    totalPasses,
    passesCompleted,
    passesFailed,
    passCompletionRate,
    clearances,
    catches,
    punches,
    drops,
    yellowCards,
    redCards,
    cleanSheet,
    playerRating,
    ratingLabel,
    ratingColor,
    professionalComparison,
    savePercentageBenchmark,
    passRateBenchmark,
  };
}

interface RatingInputs {
  saves: number;
  goalsConceded: number;
  passesCompleted: number;
  passesFailed: number;
  clearances: number;
  catches: number;
  punches: number;
  drops: number;
  yellowCards: number;
  redCards: number;
  cleanSheet: boolean;
}

function calculateRating(s: RatingInputs): number {
  let rating = 6.0;

  // Shot-stopping (most important for a GK)
  rating += s.saves * 0.3;
  rating -= s.goalsConceded * 0.45;

  // Distribution
  rating += s.passesCompleted * 0.05;
  rating -= s.passesFailed * 0.12;

  // Aerial ability & handling
  rating += s.catches * 0.2;
  rating += s.punches * 0.08;
  rating += s.clearances * 0.1;
  rating -= s.drops * 0.55;

  // Discipline
  rating -= s.yellowCards * 0.35;
  rating -= s.redCards * 1.2;

  // Clean sheet bonus
  if (s.cleanSheet) rating += 0.5;

  // Clamp to professional range 4.0 – 10.0
  return Math.max(4.0, Math.min(10.0, Math.round(rating * 10) / 10));
}

function getRatingDescriptors(rating: number): {
  label: string;
  color: string;
  comparison: string;
} {
  if (rating >= 9.0) {
    return {
      label: 'Outstanding',
      color: '#00e676',
      comparison: 'World-class level — Comparable to Alisson Becker, Ederson',
    };
  }
  if (rating >= 8.0) {
    return {
      label: 'Excellent',
      color: '#69f0ae',
      comparison: 'Elite performer — Champions League standard',
    };
  }
  if (rating >= 7.0) {
    return {
      label: 'Good',
      color: '#b2ff59',
      comparison: 'Solid professional — Top-flight standard',
    };
  }
  if (rating >= 6.5) {
    return {
      label: 'Above Average',
      color: '#ffff00',
      comparison: 'Strong performance — Championship / League One level',
    };
  }
  if (rating >= 6.0) {
    return {
      label: 'Average',
      color: '#ffd740',
      comparison: 'Standard professional performance',
    };
  }
  if (rating >= 5.0) {
    return {
      label: 'Below Average',
      color: '#ff6d00',
      comparison: 'Room to improve — focus on shot-stopping and distribution',
    };
  }
  return {
    label: 'Poor',
    color: '#ff1744',
    comparison: 'Difficult match — analyze key moments to identify improvements',
  };
}

function getBenchmarkText(value: number, benchmark: number, unit: string, label: string): string {
  if (value === 0) return `No ${label} data recorded yet`;
  const diff = Math.abs(value - benchmark);
  const direction = value >= benchmark ? 'above' : 'below';
  return `${value.toFixed(1)}${unit} — ${diff.toFixed(1)}${unit} ${direction} professional average (${benchmark}${unit})`;
}

export function formatPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getElapsedSeconds(match: {
  startedAt: number;
  totalPausedMs: number;
  pausedAt: number | null;
}): number {
  const now = Date.now();
  const pausedExtra = match.pausedAt != null ? now - match.pausedAt : 0;
  const elapsed = (now - match.startedAt - match.totalPausedMs - pausedExtra) / 1000;
  return Math.max(0, elapsed);
}
