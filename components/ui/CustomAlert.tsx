import React, { useState } from 'react';
import { Platform, Alert, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  onOk?: () => void;
}

interface CustomAlertProps {
  alertConfig: AlertConfig;
  setAlertConfig: (config: AlertConfig) => void;
}

export function CustomAlert({ alertConfig, setAlertConfig }: CustomAlertProps) {
  if (Platform.OS !== 'web') return null;

  return (
    <Modal visible={alertConfig.visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{alertConfig.title}</Text>
          <Text style={styles.message}>{alertConfig.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              alertConfig.onOk?.();
              setAlertConfig({ ...alertConfig, visible: false });
            }}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  return { alertConfig, setAlertConfig, showAlert };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});