import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

export function CandleIcon({ size = 120 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Candle body */}
      <View style={[styles.candleBody, { width: size * 0.4, height: size * 0.6 }]}>
        {/* Eyes */}
        <View style={styles.eyes}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
      </View>
      {/* Wick */}
      <View style={[styles.wick, { width: size * 0.02, height: size * 0.1 }]} />
      {/* Flame */}
      <View style={[styles.flame, { width: size * 0.25, height: size * 0.3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  candleBody: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#1B5E20',
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -10,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B5E20',
  },
  wick: {
    backgroundColor: '#FCD34D',
    marginTop: -2,
    borderRadius: 1,
  },
  flame: {
    backgroundColor: '#F59E0B',
    borderRadius: 50,
    marginTop: -2,
    borderWidth: 3,
    borderColor: '#1B5E20',
    position: 'relative',
  },
});

