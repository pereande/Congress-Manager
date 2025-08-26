import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  dismissible?: boolean;
}

export function NotificationBanner() {
  const { alerts, dismissAlert } = useApp();

  if (alerts.length === 0) return null;

  const latestAlert = alerts[0];
  
  const getIconName = (type: string) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getBannerStyle = (type: string) => {
    switch (type) {
      case 'success': return styles.successBanner;
      case 'warning': return styles.warningBanner;
      case 'error': return styles.errorBanner;
      default: return styles.infoBanner;
    }
  };

  return (
    <View style={[styles.banner, getBannerStyle('info')]}>
      <View style={styles.content}>
        <MaterialIcons 
          name={getIconName('info')} 
          size={20} 
          color={COLORS.surface} 
          style={styles.icon}
        />
        <Text style={styles.text} numberOfLines={2}>
          {latestAlert.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  infoBanner: {
    backgroundColor: COLORS.primary,
  },
  successBanner: {
    backgroundColor: COLORS.success,
  },
  warningBanner: {
    backgroundColor: COLORS.warning,
  },
  errorBanner: {
    backgroundColor: COLORS.error,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});