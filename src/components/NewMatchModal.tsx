import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
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

interface NewMatchModalProps {
  visible: boolean;
  onStart: (opponent: string, competition: string) => void;
  onCancel: () => void;
}

export default function NewMatchModal({ visible, onStart, onCancel }: NewMatchModalProps) {
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = opponent.trim().length >= 2
    ? CLUBS.filter((c) => c.toLowerCase().includes(opponent.toLowerCase())).slice(0, 6)
    : [];

  function selectClub(club: string) {
    setOpponent(club);
    setShowSuggestions(false);
  }

  function handleStart() {
    onStart(opponent.trim(), competition.trim());
    setOpponent('');
    setCompetition('');
    setShowSuggestions(false);
  }

  function handleCancel() {
    setOpponent('');
    setCompetition('');
    setShowSuggestions(false);
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>New Match</Text>

          <Text style={styles.label}>Opponent (optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Search club or type name…"
              placeholderTextColor="#6e7681"
              value={opponent}
              onChangeText={(t) => { setOpponent(t); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              autoFocus
            />
            {opponent.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { setOpponent(''); setShowSuggestions(false); }}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {suggestions.map((club) => {
                  const [teamName, div] = club.includes(' - ') ? club.split(' - ') : [club, ''];
                  return (
                    <TouchableOpacity key={club} style={styles.suggestion} onPress={() => selectClub(club)}>
                      <Text style={styles.suggestionTeam}>{teamName}</Text>
                      {div ? (
                        <Text style={[styles.suggestionDiv, { color: divisionColor(div) }]}>{div}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>Competition (optional)</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder="e.g. NorCal Premier, Gold, Friendly…"
            placeholderTextColor="#6e7681"
            value={competition}
            onChangeText={setCompetition}
            onSubmitEditing={handleStart}
            returnKeyType="done"
          />

          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>Start Match</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#30363d',
  },
  title: { color: '#e6edf3', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  label: { color: '#8b949e', fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { position: 'relative', marginBottom: 4 },
  input: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    padding: 14,
    color: '#e6edf3',
    fontSize: 15,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 4,
  },
  clearText: { color: '#6e7681', fontSize: 14 },
  dropdown: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    marginBottom: 12,
    maxHeight: 200,
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
  startBtn: {
    backgroundColor: '#00e676',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  startBtnText: { color: '#000', fontSize: 17, fontWeight: '800' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#8b949e', fontSize: 15 },
});
