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
} from 'react-native';

interface NewMatchModalProps {
  visible: boolean;
  onStart: (opponent: string, competition: string) => void;
  onCancel: () => void;
}

export default function NewMatchModal({ visible, onStart, onCancel }: NewMatchModalProps) {
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');

  function handleStart() {
    onStart(opponent.trim(), competition.trim());
    setOpponent('');
    setCompetition('');
  }

  function handleCancel() {
    setOpponent('');
    setCompetition('');
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>New Match</Text>

          <Text style={styles.label}>Opponent (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. FC Barcelona"
            placeholderTextColor="#6e7681"
            value={opponent}
            onChangeText={setOpponent}
            autoFocus
          />

          <Text style={styles.label}>Competition (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Premier League"
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
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
  input: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    padding: 14,
    color: '#e6edf3',
    fontSize: 15,
    marginBottom: 16,
  },
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
