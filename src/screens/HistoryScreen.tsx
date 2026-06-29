import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { computeStats, formatPlaytime } from '../utils/calculations';
import { Match, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { matches, deleteMatch } = useApp();

  const finished = useMemo(
    () => matches.filter((m) => !m.isActive).sort((a, b) => b.date - a.date),
    [matches]
  );

  function handleDelete(match: Match) {
    Alert.alert('Delete Match', `Remove the match${match.opponent ? ` vs ${match.opponent}` : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMatch(match.id),
      },
    ]);
  }

  if (finished.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyBody}>Completed matches will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Match History</Text>
        <Text style={styles.matchCount}>{finished.length} matches</Text>
      </View>

      <FlatList
        data={finished}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: match }) => {
          const stats = computeStats(match.events);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('MatchSummary', { matchId: match.id })}
              onLongPress={() => handleDelete(match)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <Text style={styles.opponent}>
                    {match.opponent || 'Unknown opponent'}
                  </Text>
                  <Text style={styles.meta}>
                    {match.competition ? `${match.competition} · ` : ''}
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.playtime}>{formatPlaytime(match.playtime)} played</Text>
                </View>

                <View style={styles.cardRight}>
                  <View style={[styles.ratingBubble, { borderColor: stats.ratingColor }]}>
                    <Text style={[styles.ratingNum, { color: stats.ratingColor }]}>
                      {stats.playerRating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.ratingLabel, { color: stats.ratingColor }]}>
                    {stats.ratingLabel}
                  </Text>
                  {stats.cleanSheet && (
                    <View style={styles.csBadge}>
                      <Text style={styles.csText}>CS</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.statStrip}>
                <StatPill label="Saves" value={stats.saves} color="#00e676" />
                <StatPill label="Goals" value={stats.goalsConceded} color="#ff1744" />
                <StatPill
                  label="Save %"
                  value={stats.totalShots > 0 ? `${stats.savePercentage.toFixed(0)}%` : '—'}
                  color="#69f0ae"
                />
                <StatPill
                  label="Pass %"
                  value={stats.totalPasses > 0 ? `${stats.passCompletionRate.toFixed(0)}%` : '—'}
                  color="#40c4ff"
                />
                <StatPill label="Clear" value={stats.clearances} color="#b2ff59" />
              </View>

              <View style={styles.tapHint}>
                <Ionicons name="chevron-forward" size={14} color="#6e7681" />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#21262d',
  },
  screenTitle: { color: '#e6edf3', fontSize: 22, fontWeight: '800' },
  matchCount: { color: '#6e7681', fontSize: 13 },
  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardLeft: { flex: 1 },
  opponent: { color: '#e6edf3', fontSize: 16, fontWeight: '700' },
  meta: { color: '#8b949e', fontSize: 12, marginTop: 3 },
  playtime: { color: '#6e7681', fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'center', marginLeft: 12 },
  ratingBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1117',
  },
  ratingNum: { fontSize: 18, fontWeight: '900' },
  ratingLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  csBadge: {
    backgroundColor: '#0d2818',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  csText: { color: '#00e676', fontSize: 9, fontWeight: '800' },
  statStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#21262d',
    paddingTop: 10,
  },
  pill: { alignItems: 'center' },
  pillValue: { fontSize: 15, fontWeight: '800' },
  pillLabel: { color: '#6e7681', fontSize: 9, marginTop: 2, fontWeight: '600' },
  tapHint: { position: 'absolute', right: 10, top: '50%' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#e6edf3', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  emptyBody: { color: '#8b949e', fontSize: 14, textAlign: 'center' },
});
