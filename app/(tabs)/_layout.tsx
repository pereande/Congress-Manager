import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { AlertBanner } from '@/components/ui/AlertBanner';

export default function TabLayout() {
  const { user } = useApp();
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 60,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      default: 8,
    }),
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
  };

  return (
    <>
      <AlertBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inscrição',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="assignment" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="counting"
          options={{
            title: 'Contagem',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            href: user?.role === 'admin' ? '/admin' : null,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}