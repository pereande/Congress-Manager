import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';

export function AlertBanner() {
  const { alerts } = useApp();

  if (alerts.length === 0) return null;

  const latestAlert = alerts[0];

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{latestAlert.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  text: {
    color: COLORS.surface,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});