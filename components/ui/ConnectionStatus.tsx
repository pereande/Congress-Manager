
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { supabase } from '@/services/supabase';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      // Test network connectivity
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }

    try {
      // Test Supabase connectivity
      await supabase.auth.getSession();
      setIsSupabaseConnected(true);
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setIsSupabaseConnected(false);
    }

    setLastCheck(new Date());
  };

  if (isOnline && isSupabaseConnected) {
    return null; // Don't show anything when all is working
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <MaterialIcons 
          name={isOnline ? 'wifi' : 'wifi-off'} 
          size={16} 
          color={isOnline ? COLORS.success : COLORS.error} 
        />
        <Text style={[styles.statusText, { color: isOnline ? COLORS.success : COLORS.error }]}>
          Internet: {isOnline ? 'Conectado' : 'Desconectado'}
        </Text>
      </View>
      
      <View style={styles.statusRow}>
        <MaterialIcons 
          name={isSupabaseConnected ? 'cloud-done' : 'cloud-off'} 
          size={16} 
          color={isSupabaseConnected ? COLORS.success : COLORS.error} 
        />
        <Text style={[styles.statusText, { color: isSupabaseConnected ? COLORS.success : COLORS.error }]}>
          Servidor: {isSupabaseConnected ? 'Conectado' : 'Desconectado'}
        </Text>
      </View>
      
      <Text style={styles.lastCheckText}>
        Última verificação: {lastCheck.toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  lastCheckText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
