import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
  wide?: boolean;
}

export default function StatCard({ label, value, subtitle, accent = '#00d4ff', wide }: StatCardProps) {
  return (
    <View style={[styles.card, wide && styles.wide]}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 14,
    margin: 5,
    flex: 1,
    minWidth: 130,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  wide: {
    minWidth: '90%',
    flex: 0,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6e7681',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
});
