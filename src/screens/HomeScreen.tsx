import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { computeStats, formatPlaytime } from '../utils/calculations';
import { RootStackParamList } from '../types';
import RatingGauge from '../components/RatingGauge';
import StatCard from '../components/StatCard';
import NewMatchModal from '../components/NewMatchModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { matches, activeMatch, createMatch, currentUser, signOut } = useApp();
  const [showNewMatch, setShowNewMatch] = useState(false);

  const recentMatches = matches.filter((m) => !m.isActive).slice(0, 5);

  const careerStats = useMemo(() => {
    const finished = matches.filter((m) => !m.isActive && m.events.length > 0);
    if (finished.length === 0) return null;

    const allEvents = finished.flatMap((m) => m.events);
    const stats = computeStats(allEvents);
    const totalPlaytime = finished.reduce((sum, m) => sum + m.playtime, 0);
    const cleanSheets = finished.filter((m) => computeStats(m.events).cleanSheet).length;
    const avgRating =
      finished.reduce((sum, m) => sum + computeStats(m.events).playerRating, 0) / finished.length;

    return { ...stats, totalPlaytime, cleanSheets, totalMatches: finished.length, avgRating };
  }, [matches]);

  function handleStartMatch() {
    if (activeMatch) {
      navigation.navigate('Match', { matchId: activeMatch.id });
      return;
    }
    setShowNewMatch(true);
  }

  function handleNewMatchStart(opponent: string, competition: string) {
    setShowNewMatch(false);
    const match = createMatch(opponent, competition);
    navigation.navigate('Match', { matchId: match.id });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>GK Stats</Text>
            <Text style={styles.subtitle}>Goalkeeper Performance Tracker</Text>
          </View>
          {currentUser && (
            <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
              <Ionicons
                name={currentUser.isAnonymous ? 'person-outline' : 'log-out-outline'}
                size={20}
                color="#8b949e"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Active match banner */}
        {activeMatch && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => navigation.navigate('Match', { matchId: activeMatch.id })}
          >
            <Ionicons name="radio-button-on" size={14} color="#00e676" />
            <Text style={styles.activeBannerText}>
              {' '}Match in progress
              {activeMatch.opponent ? ` vs ${activeMatch.opponent}` : ''} — tap to return
            </Text>
          </TouchableOpacity>
        )}

        {/* Start Match CTA */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartMatch}>
          <Ionicons name="play-circle" size={28} color="#000" />
          <Text style={styles.startButtonText}>
            {activeMatch ? 'Return to Match' : 'Start New Match'}
          </Text>
        </TouchableOpacity>

        {/* Career overview */}
        {careerStats ? (
          <>
            <Text style={styles.sectionTitle}>Career Overview</Text>
            <View style={styles.ratingSection}>
              <RatingGauge
                rating={careerStats.avgRating}
                label={careerStats.ratingLabel}
                color={careerStats.ratingColor}
                comparison={careerStats.professionalComparison}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard label="Matches" value={careerStats.totalMatches} accent="#00d4ff" />
              <StatCard
                label="Clean Sheets"
                value={careerStats.cleanSheets}
                accent="#00e676"
                subtitle={`${((careerStats.cleanSheets / careerStats.totalMatches) * 100).toFixed(0)}% rate`}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Save %"
                value={`${careerStats.savePercentage.toFixed(1)}%`}
                accent="#69f0ae"
                subtitle={careerStats.savePercentageBenchmark}
              />
              <StatCard
                label="Pass %"
                value={`${careerStats.passCompletionRate.toFixed(1)}%`}
                accent="#40c4ff"
                subtitle={careerStats.passRateBenchmark}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Total Saves" value={careerStats.saves} accent="#b2ff59" />
              <StatCard
                label="Playtime"
                value={formatPlaytime(careerStats.totalPlaytime)}
                accent="#ea80fc"
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧤</Text>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyBody}>
              Start your first match to begin tracking your performance and building your stats profile.
            </Text>
          </View>
        )}

        {/* Recent matches */}
        {recentMatches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            {recentMatches.map((match) => {
              const s = computeStats(match.events);
              return (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchRow}
                  onPress={() => navigation.navigate('MatchSummary', { matchId: match.id })}
                >
                  <View style={styles.matchLeft}>
                    <Text style={styles.matchOpponent}>
                      {match.opponent || 'Unknown opponent'}
                    </Text>
                    <Text style={styles.matchMeta}>
                      {match.competition ? `${match.competition} · ` : ''}
                      {new Date(match.date).toLocaleDateString()} · {formatPlaytime(match.playtime)}
                    </Text>
                  </View>
                  <View style={styles.matchRight}>
                    <Text style={[styles.matchRating, { color: s.ratingColor }]}>
                      {s.playerRating.toFixed(1)}
                    </Text>
                    <Text style={styles.matchRatingLabel}>{s.ratingLabel}</Text>
                    {s.cleanSheet && (
                      <Text style={styles.cleanSheetBadge}>CS</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      <NewMatchModal
        visible={showNewMatch}
        onStart={handleNewMatchStart}
        onCancel={() => setShowNewMatch(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 4 },
  appName: { color: '#e6edf3', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#8b949e', fontSize: 13, marginTop: 2 },
  signOutBtn: { padding: 8 },
  activeBanner: {
    backgroundColor: '#0d2818',
    borderColor: '#00e676',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBannerText: { color: '#00e676', fontSize: 13, fontWeight: '600' },
  startButton: {
    backgroundColor: '#00e676',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 10,
  },
  startButtonText: { color: '#000', fontSize: 18, fontWeight: '800' },
  sectionTitle: {
    color: '#e6edf3',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  ratingSection: { alignItems: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', marginBottom: 2 },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#e6edf3', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  emptyBody: { color: '#8b949e', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  matchRow: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  matchLeft: { flex: 1 },
  matchOpponent: { color: '#e6edf3', fontSize: 15, fontWeight: '700' },
  matchMeta: { color: '#8b949e', fontSize: 12, marginTop: 3 },
  matchRight: { alignItems: 'flex-end' },
  matchRating: { fontSize: 22, fontWeight: '900' },
  matchRatingLabel: { color: '#8b949e', fontSize: 10, marginTop: 1 },
  cleanSheetBadge: {
    backgroundColor: '#0d2818',
    color: '#00e676',
    fontSize: 9,
    fontWeight: '800',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 3,
    overflow: 'hidden',
  },
});
