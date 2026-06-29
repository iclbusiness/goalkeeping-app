import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { computeStats, formatPlaytime } from '../utils/calculations';
import { RootStackParamList } from '../types';
import RatingGauge from '../components/RatingGauge';
import StatCard from '../components/StatCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MatchSummary'>;

export default function MatchSummaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getMatchById, deleteMatch } = useApp();

  const match = getMatchById(route.params.matchId);

  const stats = useMemo(() => {
    if (!match) return null;
    return computeStats(match.events);
  }, [match]);

  if (!match || !stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: '#fff', padding: 20 }}>Match not found.</Text>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    Alert.alert('Delete Match', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMatch(match.id);
          navigation.navigate('MainTabs');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#8b949e" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ff1744" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Match Report</Text>
        <Text style={styles.subtitle}>
          {match.opponent ? `vs ${match.opponent}` : 'Unnamed Match'}
          {match.competition ? ` · ${match.competition}` : ''}
        </Text>
        <Text style={styles.date}>
          {new Date(match.date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {' · '}
          {formatPlaytime(match.playtime)} played
        </Text>

        {/* Clean sheet banner */}
        {stats.cleanSheet && (
          <View style={styles.cleanSheetBanner}>
            <Text style={styles.cleanSheetText}>🏆 CLEAN SHEET</Text>
          </View>
        )}

        {/* Rating gauge */}
        <View style={styles.ratingSection}>
          <RatingGauge
            rating={stats.playerRating}
            label={stats.ratingLabel}
            color={stats.ratingColor}
            comparison={stats.professionalComparison}
          />
        </View>

        {/* Shot-stopping */}
        <SectionTitle title="Shot Stopping" />
        <View style={styles.row}>
          <StatCard label="Saves" value={stats.saves} accent="#00e676" />
          <StatCard label="Goals Against" value={stats.goalsConceded} accent="#ff1744" />
        </View>
        <View style={styles.row}>
          <StatCard
            label="Save Percentage"
            value={stats.totalShots > 0 ? `${stats.savePercentage.toFixed(1)}%` : '—'}
            accent="#69f0ae"
            subtitle={stats.savePercentageBenchmark}
          />
        </View>

        {/* Distribution */}
        <SectionTitle title="Distribution" />
        <View style={styles.row}>
          <StatCard label="Passes Complete" value={stats.passesCompleted} accent="#2196F3" />
          <StatCard label="Passes Failed" value={stats.passesFailed} accent="#FF9800" />
        </View>
        <View style={styles.row}>
          <StatCard
            label="Pass Completion"
            value={stats.totalPasses > 0 ? `${stats.passCompletionRate.toFixed(1)}%` : '—'}
            accent="#40c4ff"
            subtitle={stats.passRateBenchmark}
          />
        </View>

        {/* Aerial & Physical */}
        <SectionTitle title="Aerial & Physical" />
        <View style={styles.row}>
          <StatCard label="Clearances" value={stats.clearances} accent="#b2ff59" />
          <StatCard label="Catches" value={stats.catches} accent="#ea80fc" />
          <StatCard label="Punches" value={stats.punches} accent="#40c4ff" />
        </View>

        {/* Errors & Discipline */}
        {(stats.drops > 0 || stats.yellowCards > 0 || stats.redCards > 0) && (
          <>
            <SectionTitle title="Errors & Discipline" />
            <View style={styles.row}>
              {stats.drops > 0 && (
                <StatCard label="Drops / Errors" value={stats.drops} accent="#ff6d00" />
              )}
              {stats.yellowCards > 0 && (
                <StatCard label="Yellow Cards" value={stats.yellowCards} accent="#ffd740" />
              )}
              {stats.redCards > 0 && (
                <StatCard label="Red Cards" value={stats.redCards} accent="#ff1744" />
              )}
            </View>
          </>
        )}

        {/* Event timeline (last 10) */}
        {match.events.length > 0 && (
          <>
            <SectionTitle title="Event Timeline" />
            <View style={styles.timeline}>
              {[...match.events].reverse().slice(0, 20).map((event) => (
                <View key={event.id} style={styles.timelineItem}>
                  <Text style={styles.timelineTime}>{formatPlaytime(event.matchTime)}</Text>
                  <Text style={styles.timelineEvent}>{eventLabel(event.type)}</Text>
                </View>
              ))}
              {match.events.length > 20 && (
                <Text style={styles.moreEvents}>
                  + {match.events.length - 20} more events
                </Text>
              )}
            </View>
          </>
        )}

        {/* Done button */}
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function eventLabel(type: string): string {
  const labels: Record<string, string> = {
    save: '🧤 Save',
    goal_conceded: '⚽ Goal Conceded',
    pass_success: '✅ Pass Completed',
    pass_fail: '❌ Pass Failed',
    clearance: '🦵 Clearance',
    catch_cross: '✋ Caught Cross',
    punch: '👊 Punch',
    drop: '💥 Drop / Error',
    yellow_card: '🟨 Yellow Card',
    red_card: '🟥 Red Card',
  };
  return labels[type] ?? type;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 16, paddingBottom: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: '#8b949e', fontSize: 15 },
  title: { color: '#e6edf3', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: '#8b949e', fontSize: 14, marginBottom: 2 },
  date: { color: '#6e7681', fontSize: 12, marginBottom: 20 },
  cleanSheetBanner: {
    backgroundColor: '#0d2818',
    borderColor: '#00e676',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cleanSheetText: { color: '#00e676', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  ratingSection: { alignItems: 'center', marginBottom: 28 },
  sectionTitle: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  row: { flexDirection: 'row', marginBottom: 2 },
  timeline: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    gap: 10,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineTime: { color: '#8b949e', fontSize: 12, fontVariant: ['tabular-nums'], width: 44 },
  timelineEvent: { color: '#e6edf3', fontSize: 14, flex: 1 },
  moreEvents: { color: '#6e7681', fontSize: 12, textAlign: 'center', marginTop: 4 },
  doneBtn: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  doneBtnText: { color: '#e6edf3', fontSize: 16, fontWeight: '700' },
});
