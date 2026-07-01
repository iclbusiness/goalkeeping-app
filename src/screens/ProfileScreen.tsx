import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { computeStats } from '../utils/calculations';
import { CLUBS } from '../data/clubs';

function divisionColor(division: string): string {
  if (division === 'MLS Next') return '#00e676';
  if (division === 'ECNL') return '#7c4dff';
  if (division === 'ECNL RL') return '#b388ff';
  if (division === 'NorCal Premier') return '#ffd740';
  if (division === 'Gold') return '#ffab40';
  if (division === 'Silver') return '#e0e0e0';
  if (division === 'Bronze') return '#ff6d00';
  if (division === 'Copper') return '#ef9a9a';
  return '#8b949e';
}

export default function ProfileScreen() {
  const { userProfile, updateProfile, matches } = useApp();

  const [name, setName] = useState(userProfile?.name ?? '');
  const [myTeam, setMyTeam] = useState(userProfile?.myTeam ?? '');
  const [jerseyNumber, setJerseyNumber] = useState(userProfile?.jerseyNumber ?? '');
  const [showTeamSearch, setShowTeamSearch] = useState(false);
  const [saved, setSaved] = useState(false);

  const teamSuggestions =
    myTeam.trim().length >= 2
      ? CLUBS.filter((c) => c.toLowerCase().includes(myTeam.toLowerCase())).slice(0, 8)
      : [];

  const finishedMatches = matches.filter((m) => !m.isActive && m.events.length > 0);
  const recentMatches = finishedMatches.slice(0, 10);

  const ratingHistory = recentMatches.map((m) => {
    const s = computeStats(m.events);
    return {
      id: m.id,
      rating: s.playerRating,
      label: s.ratingLabel,
      color: s.ratingColor,
      opponent: m.opponent,
      date: m.date,
    };
  });

  const last5 = ratingHistory.slice(0, 5);
  const prev5 = ratingHistory.slice(5, 10);
  const avgLast5 = last5.length > 0 ? last5.reduce((s, r) => s + r.rating, 0) / last5.length : 0;
  const avgPrev5 = prev5.length > 0 ? prev5.reduce((s, r) => s + r.rating, 0) / prev5.length : 0;
  const trend =
    last5.length >= 3
      ? avgLast5 > avgPrev5 + 0.2
        ? 'up'
        : avgLast5 < avgPrev5 - 0.2
        ? 'down'
        : 'stable'
      : 'stable';

  async function handleSave() {
    await updateProfile({ name: name.trim(), myTeam: myTeam.trim(), jerseyNumber: jerseyNumber.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const [teamPart, divisionPart] = myTeam.includes(' - ')
    ? myTeam.split(' - ')
    : [myTeam, ''];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>My Profile</Text>

          {/* Current team display */}
          {myTeam ? (
            <View style={styles.teamCard}>
              <Text style={styles.teamCardLabel}>Playing for</Text>
              <Text style={styles.teamCardName}>{teamPart}</Text>
              {divisionPart ? (
                <Text style={[styles.teamCardDiv, { color: divisionColor(divisionPart) }]}>
                  {divisionPart}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Name */}
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#6e7681"
            value={name}
            onChangeText={setName}
          />

          {/* Team picker */}
          <Text style={styles.label}>My Team</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Search your team…"
              placeholderTextColor="#6e7681"
              value={myTeam}
              onChangeText={(t) => {
                setMyTeam(t);
                setShowTeamSearch(true);
              }}
              onFocus={() => setShowTeamSearch(true)}
            />
            {myTeam.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setMyTeam('');
                  setShowTeamSearch(false);
                }}
              >
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {showTeamSearch && teamSuggestions.length > 0 && (
            <View style={styles.dropdown}>
              {teamSuggestions.map((club) => {
                const [tName, div] = club.includes(' - ') ? club.split(' - ') : [club, ''];
                return (
                  <TouchableOpacity
                    key={club}
                    style={styles.suggestion}
                    onPress={() => {
                      setMyTeam(club);
                      setShowTeamSearch(false);
                    }}
                  >
                    <Text style={styles.suggestionTeam}>{tName}</Text>
                    {div ? (
                      <Text style={[styles.suggestionDiv, { color: divisionColor(div) }]}>
                        {div}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Jersey number */}
          <Text style={styles.label}>Jersey Number (optional)</Text>
          <TextInput
            style={[styles.input, { marginBottom: 4 }]}
            placeholder="#1"
            placeholderTextColor="#6e7681"
            value={jerseyNumber}
            onChangeText={setJerseyNumber}
            keyboardType="numeric"
            maxLength={2}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
          >
            <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={18} color="#000" />
            <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Profile'}</Text>
          </TouchableOpacity>

          {/* Progression */}
          {ratingHistory.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Performance Progression</Text>

              <View style={styles.trendCard}>
                <Ionicons
                  name={
                    trend === 'up'
                      ? 'trending-up'
                      : trend === 'down'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={30}
                  color={trend === 'up' ? '#00e676' : trend === 'down' ? '#ff1744' : '#8b949e'}
                />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.trendLabel}>
                    {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                  </Text>
                  <Text style={styles.trendSub}>
                    Last 5 avg: {avgLast5.toFixed(1)}
                    {prev5.length >= 2 ? `  ·  Prev 5: ${avgPrev5.toFixed(1)}` : ''}
                  </Text>
                </View>
              </View>

              <Text style={styles.subLabel}>Recent Matches</Text>
              {ratingHistory.map((r) => (
                <View key={r.id} style={styles.ratingRow}>
                  <View style={styles.ratingMeta}>
                    <Text style={styles.ratingOpponent} numberOfLines={1}>
                      {r.opponent || 'Unknown'}
                    </Text>
                    <Text style={styles.ratingDate}>
                      {new Date(r.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.ratingTrackWrap}>
                    <View style={styles.ratingTrack}>
                      <View
                        style={[styles.ratingFill, { flex: r.rating, backgroundColor: r.color }]}
                      />
                      <View style={{ flex: Math.max(10 - r.rating, 0) }} />
                    </View>
                    <Text style={[styles.ratingValue, { color: r.color }]}>
                      {r.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {finishedMatches.length === 0 && (
            <View style={styles.emptyProgression}>
              <Text style={styles.emptyText}>
                Complete matches to see your progression here.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  title: { color: '#e6edf3', fontSize: 28, fontWeight: '900', marginBottom: 20, marginTop: 4 },

  teamCard: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  teamCardLabel: { color: '#6e7681', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  teamCardName: { color: '#e6edf3', fontSize: 18, fontWeight: '800' },
  teamCardDiv: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  label: { color: '#8b949e', fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12 },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    padding: 14,
    color: '#e6edf3',
    fontSize: 15,
    marginBottom: 4,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 4,
    justifyContent: 'center',
    padding: 4,
  },
  clearText: { color: '#6e7681', fontSize: 14 },

  dropdown: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    marginBottom: 4,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  suggestionTeam: { color: '#e6edf3', fontSize: 14, flex: 1 },
  suggestionDiv: { fontSize: 12, fontWeight: '700', marginLeft: 8 },

  saveBtn: {
    backgroundColor: '#00e676',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  saveBtnSuccess: { backgroundColor: '#00b248' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#21262d', marginVertical: 28 },
  sectionTitle: { color: '#e6edf3', fontSize: 18, fontWeight: '700', marginBottom: 14 },

  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  trendLabel: { color: '#e6edf3', fontSize: 17, fontWeight: '800' },
  trendSub: { color: '#8b949e', fontSize: 13, marginTop: 2 },

  subLabel: { color: '#6e7681', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },

  ratingRow: {
    marginBottom: 10,
  },
  ratingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ratingOpponent: { color: '#e6edf3', fontSize: 13, fontWeight: '600', flex: 1 },
  ratingDate: { color: '#6e7681', fontSize: 12 },
  ratingTrackWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#21262d',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ratingFill: { borderRadius: 4 },
  ratingValue: { fontSize: 13, fontWeight: '800', minWidth: 30, textAlign: 'right' },

  emptyProgression: { marginTop: 20, alignItems: 'center' },
  emptyText: { color: '#6e7681', fontSize: 14, textAlign: 'center' },
});
