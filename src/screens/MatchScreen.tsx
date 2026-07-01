import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { computeStats, formatPlaytime } from '../utils/calculations';
import { RootStackParamList, StatEventType } from '../types';
import StatButton from '../components/StatButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Match'>;

interface ButtonDef {
  type: StatEventType;
  label: string;
  emoji: string;
  color: string;
}

const STAT_BUTTONS: ButtonDef[] = [
  { type: 'save', label: 'Save', emoji: '🧤', color: '#00e676' },
  { type: 'goal_conceded', label: 'Goal Against', emoji: '⚽', color: '#ff1744' },
  { type: 'pass_success', label: 'Pass ✓', emoji: '✅', color: '#2196F3' },
  { type: 'pass_fail', label: 'Pass ✗', emoji: '❌', color: '#FF9800' },
  { type: 'clearance', label: 'Clearance', emoji: '🦵', color: '#b2ff59' },
  { type: 'catch_cross', label: 'Catch Cross', emoji: '✋', color: '#ea80fc' },
  { type: 'punch', label: 'Punch', emoji: '👊', color: '#40c4ff' },
  { type: 'drop', label: 'Drop / Error', emoji: '💥', color: '#ff6d00' },
];

export default function MatchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {
    activeMatch,
    elapsedSeconds,
    isTimerRunning,
    logEvent,
    undoLastEvent,
    pauseTimer,
    resumeTimer,
    endMatch,
    getMatchById,
  } = useApp();

  const [confirmEnd, setConfirmEnd] = useState(false);

  const match = activeMatch ?? getMatchById(route.params.matchId);

  useEffect(() => {
    if (!match) navigation.goBack();
  }, [match]);

  const stats = useMemo(() => computeStats(match?.events ?? []), [match?.events]);

  function handleTogglePause() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function confirmEndMatch() {
    const matchId = match!.id;
    await endMatch();
    setConfirmEnd(false);
    navigation.replace('MatchSummary', { matchId });
  }

  function handleUndo() {
    undoLastEvent();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  if (!match) return null;

  const display = match.isActive ? formatPlaytime(elapsedSeconds) : formatPlaytime(match.playtime);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Timer bar */}
      <View style={styles.timerBar}>
        <View style={styles.matchInfo}>
          <Text style={styles.opponent}>
            {match.opponent ? `vs ${match.opponent}` : 'Match'}
          </Text>
          {match.competition ? (
            <Text style={styles.competition}>{match.competition}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.timerContainer} onPress={handleTogglePause}>
          <Text style={styles.timerText}>{display}</Text>
          <Ionicons
            name={isTimerRunning ? 'pause-circle' : 'play-circle'}
            size={22}
            color={isTimerRunning ? '#8b949e' : '#00e676'}
          />
        </TouchableOpacity>
      </View>

      {/* Live score strip */}
      <View style={styles.scoreStrip}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreNum, { color: '#00e676' }]}>{stats.saves}</Text>
          <Text style={styles.scoreLabel}>Saves</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreNum, { color: '#ff1744' }]}>{stats.goalsConceded}</Text>
          <Text style={styles.scoreLabel}>Goals</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreNum, { color: '#00d4ff' }]}>
            {stats.totalShots > 0 ? `${stats.savePercentage.toFixed(0)}%` : '—'}
          </Text>
          <Text style={styles.scoreLabel}>Save %</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreNum, { color: '#ea80fc' }]}>{match.events.length}</Text>
          <Text style={styles.scoreLabel}>Events</Text>
        </View>
      </View>

      {/* Stat buttons grid */}
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        <View style={styles.buttonRow}>
          {STAT_BUTTONS.slice(0, 2).map((b) => (
            <StatButton
              key={b.type}
              label={b.label}
              emoji={b.emoji}
              color={b.color}
              count={stats[countKey(b.type)]}
              onPress={() => logEvent(b.type)}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          {STAT_BUTTONS.slice(2, 4).map((b) => (
            <StatButton
              key={b.type}
              label={b.label}
              emoji={b.emoji}
              color={b.color}
              count={stats[countKey(b.type)]}
              onPress={() => logEvent(b.type)}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          {STAT_BUTTONS.slice(4, 6).map((b) => (
            <StatButton
              key={b.type}
              label={b.label}
              emoji={b.emoji}
              color={b.color}
              count={stats[countKey(b.type)]}
              onPress={() => logEvent(b.type)}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          {STAT_BUTTONS.slice(6, 8).map((b) => (
            <StatButton
              key={b.type}
              label={b.label}
              emoji={b.emoji}
              color={b.color}
              count={stats[countKey(b.type)]}
              onPress={() => logEvent(b.type)}
            />
          ))}
        </View>

        {/* Card buttons (less frequent) */}
        <View style={styles.cardRow}>
          <StatButton
            size="medium"
            label="Yellow Card"
            emoji="🟨"
            color="#ffd740"
            count={stats.yellowCards}
            onPress={() => logEvent('yellow_card')}
            disabled={stats.yellowCards >= 2}
          />
          <StatButton
            size="medium"
            label="Red Card"
            emoji="🟥"
            color="#ff1744"
            count={stats.redCards}
            onPress={() => logEvent('red_card')}
            disabled={stats.redCards >= 1}
          />
        </View>
      </ScrollView>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
          <Ionicons name="arrow-undo" size={20} color="#8b949e" />
          <Text style={styles.undoBtnText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} onPress={() => setConfirmEnd(true)}>
          <Ionicons name="flag" size={18} color="#000" />
          <Text style={styles.endBtnText}>End Match</Text>
        </TouchableOpacity>
      </View>

      {/* End match confirmation overlay */}
      {confirmEnd && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmSheet}>
            <Text style={styles.confirmTitle}>End Match?</Text>
            <Text style={styles.confirmBody}>
              This will finalise your stats and calculate your rating.
            </Text>
            <TouchableOpacity style={styles.confirmEndBtn} onPress={confirmEndMatch}>
              <Text style={styles.confirmEndBtnText}>End Match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setConfirmEnd(false)}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Map event type to the key in ComputedStats for badge count
function countKey(type: StatEventType): keyof ReturnType<typeof computeStats> {
  const map: Record<StatEventType, keyof ReturnType<typeof computeStats>> = {
    save: 'saves',
    goal_conceded: 'goalsConceded',
    pass_success: 'passesCompleted',
    pass_fail: 'passesFailed',
    clearance: 'clearances',
    catch_cross: 'catches',
    punch: 'punches',
    drop: 'drops',
    yellow_card: 'yellowCards',
    red_card: 'redCards',
  };
  return map[type];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#21262d',
  },
  matchInfo: { flex: 1 },
  opponent: { color: '#e6edf3', fontSize: 16, fontWeight: '700' },
  competition: { color: '#8b949e', fontSize: 12, marginTop: 1 },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#161b22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  timerText: { color: '#e6edf3', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#161b22',
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 12,
  },
  scoreItem: { alignItems: 'center', flex: 1 },
  scoreNum: { fontSize: 22, fontWeight: '900' },
  scoreLabel: { color: '#6e7681', fontSize: 10, fontWeight: '600', marginTop: 2 },
  scoreDivider: { width: 1, height: 28, backgroundColor: '#30363d' },
  grid: { flex: 1 },
  gridContent: { padding: 8, paddingBottom: 12 },
  buttonRow: { flexDirection: 'row', marginBottom: 2 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
    gap: 12,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#21262d',
    backgroundColor: '#0d1117',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  undoBtnText: { color: '#8b949e', fontSize: 15, fontWeight: '600' },
  endBtn: {
    flex: 1,
    backgroundColor: '#ff1744',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
  },
  endBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  confirmSheet: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#30363d',
  },
  confirmTitle: { color: '#e6edf3', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  confirmBody: { color: '#8b949e', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  confirmEndBtn: {
    backgroundColor: '#ff1744',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmEndBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  confirmCancelBtn: { paddingVertical: 12, alignItems: 'center' },
  confirmCancelText: { color: '#8b949e', fontSize: 15 },
});
