import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { LoginForm } from '@/components/LoginForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function IndexPage() {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <LoginForm />
    </SafeAreaView>
  );
}