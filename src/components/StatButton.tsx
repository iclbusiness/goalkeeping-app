import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface StatButtonProps {
  label: string;
  emoji: string;
  color: string;
  onPress: () => void;
  count?: number;
  size?: 'large' | 'medium';
}

export default function StatButton({
  label,
  emoji,
  color,
  onPress,
  count,
  size = 'large',
}: StatButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: color }, isLarge ? styles.large : styles.medium]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.emoji, isLarge ? styles.emojiLarge : styles.emojiMedium]}>{emoji}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {count !== undefined && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#161b22',
    position: 'relative',
  },
  large: {
    flex: 1,
    paddingVertical: 20,
    margin: 6,
    minHeight: 90,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 4,
    minWidth: 80,
  },
  emoji: {
    marginBottom: 4,
  },
  emojiLarge: {
    fontSize: 32,
  },
  emojiMedium: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
});
