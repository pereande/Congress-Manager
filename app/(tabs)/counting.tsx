import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, DAYS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { useCustomAlert, CustomAlert } from '@/components/ui/CustomAlert';

export default function CountingPage() {
  const { user, submitCount } = useApp();
  const { alertConfig, setAlertConfig, showAlert } = useCustomAlert();
  const [selectedDay, setSelectedDay] = useState<'friday' | 'saturday' | 'sunday'>('friday');
  const [localCount, setLocalCount] = useState(0);

  if (!user?.canCount) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.accessDenied}>
          <MaterialIcons name="block" size={64} color={COLORS.error} />
          <Text style={styles.accessDeniedTitle}>Acesso Negado</Text>
          <Text style={styles.accessDeniedText}>
            Você não possui permissão para acessar a funcionalidade de contagem.
            Entre em contato com um administrador.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCount = () => {
    setLocalCount(prev => prev + 1);
  };

  const handleSubmitToCloud = async () => {
    if (localCount === 0) {
      showAlert('Aviso', 'Nenhuma contagem para enviar.');
      return;
    }

    try {
      await submitCount(selectedDay, localCount);
      showAlert('Sucesso', `Contagem de ${localCount} pessoas enviada para a nuvem!`, () => {
        setLocalCount(0);
      });
    } catch (error) {
      showAlert('Erro', 'Erro ao enviar contagem. Tente novamente.');
    }
  };

  const handleReset = () => {
    setLocalCount(0);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="add-circle-outline" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Contagem de Público</Text>
        <Text style={styles.subtitle}>Conte as pessoas presentes no evento</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.daySelector}>
          <Text style={styles.sectionTitle}>Selecione o Dia</Text>
          <View style={styles.dayButtons}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDay === day.key && styles.dayButtonActive,
                ]}
                onPress={() => setSelectedDay(day.key as 'friday' | 'saturday' | 'sunday')}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDay === day.key && styles.dayButtonTextActive,
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.counterSection}>
          <Text style={styles.sectionTitle}>Contagem Local</Text>
          <View style={styles.counterDisplay}>
            <Text style={styles.counterNumber}>{localCount}</Text>
            <Text style={styles.counterLabel}>pessoas</Text>
          </View>

          <View style={styles.counterButtons}>
            <TouchableOpacity style={styles.countButton} onPress={handleCount}>
              <MaterialIcons name="add" size={24} color={COLORS.surface} />
              <Text style={styles.countButtonText}>Contar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <MaterialIcons name="refresh" size={20} color={COLORS.textSecondary} />
              <Text style={styles.resetButtonText}>Zerar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitToCloud}>
            <MaterialIcons name="cloud-upload" size={24} color={COLORS.surface} />
            <Text style={styles.submitButtonText}>Enviar para a Nuvem</Text>
          </TouchableOpacity>
          <Text style={styles.submitHint}>
            Envie sua contagem local para somar ao total geral
          </Text>
        </View>
      </View>

      <CustomAlert alertConfig={alertConfig} setAlertConfig={setAlertConfig} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  daySelector: {},
  dayButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dayButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayButtonTextActive: {
    color: COLORS.surface,
  },
  counterSection: {
    alignItems: 'center',
  },
  counterDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  counterLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  countButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  resetButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  submitSection: {
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  submitHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 16,
  },
  accessDeniedText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});