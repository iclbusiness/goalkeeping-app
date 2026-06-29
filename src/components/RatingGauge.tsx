import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RatingGaugeProps {
  rating: number;
  label: string;
  color: string;
  comparison: string;
  size?: 'large' | 'small';
}

export default function RatingGauge({ rating, label, color, comparison, size = 'large' }: RatingGaugeProps) {
  const isLarge = size === 'large';
  const outerSize = isLarge ? 140 : 80;
  const innerSize = isLarge ? 110 : 62;
  const fontSize = isLarge ? 40 : 24;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ring,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderColor: color,
            borderWidth: isLarge ? 5 : 3,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Text style={[styles.ratingNum, { color, fontSize }]}>{rating.toFixed(1)}</Text>
          <Text style={styles.outOf}>/10</Text>
        </View>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {isLarge && <Text style={styles.comparison}>{comparison}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161b22',
  },
  ratingNum: {
    fontWeight: '900',
    lineHeight: undefined,
  },
  outOf: {
    color: '#6e7681',
    fontSize: 12,
    marginTop: -4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  comparison: {
    color: '#8b949e',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
