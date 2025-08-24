import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, PRIVILEGES, SHIFTS, DAYS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { useCustomAlert, CustomAlert } from '@/components/ui/CustomAlert';

export default function RegistrationPage() {
  const { user, registerVolunteer, volunteers } = useApp();
  const { alertConfig, setAlertConfig, showAlert } = useCustomAlert();
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    availableDays: [] as string[],
    shift: '',
    privilege: '',
  });

  const existingRegistration = volunteers.find(v => v.userId === user?.id);

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      showAlert('Erro', 'Por favor, informe seu nome completo.');
      return;
    }
    if (formData.availableDays.length === 0) {
      showAlert('Erro', 'Por favor, selecione pelo menos um dia disponível.');
      return;
    }
    if (!formData.shift) {
      showAlert('Erro', 'Por favor, selecione um turno.');
      return;
    }
    if (!formData.privilege) {
      showAlert('Erro', 'Por favor, selecione seu privilégio.');
      return;
    }

    try {
      await registerVolunteer(formData);
      showAlert('Sucesso', 'Inscrição enviada com sucesso!', () => {
        setFormData(prev => ({
          ...prev,
          fullName: '',
          availableDays: [],
          shift: '',
          privilege: '',
        }));
      });
    } catch (error) {
      showAlert('Erro', 'Erro ao enviar inscrição. Tente novamente.');
    }
  };

  if (existingRegistration) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={64} color={COLORS.success} />
          <Text style={styles.successTitle}>Inscrição Confirmada!</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{existingRegistration.fullName}</Text>
            
            <Text style={styles.infoLabel}>Dias Disponíveis:</Text>
            <Text style={styles.infoValue}>
              {existingRegistration.availableDays.map(day => 
                DAYS.find(d => d.key === day)?.label
              ).join(', ')}
            </Text>
            
            <Text style={styles.infoLabel}>Turno:</Text>
            <Text style={styles.infoValue}>{existingRegistration.shift}</Text>
            
            <Text style={styles.infoLabel}>Privilégio:</Text>
            <Text style={styles.infoValue}>{existingRegistration.privilege}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="assignment" size={32} color={COLORS.primary} />
          <Text style={styles.title}>Inscrição de Voluntário</Text>
          <Text style={styles.subtitle}>Registre sua disponibilidade para servir</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dias Disponíveis *</Text>
            <View style={styles.checkboxGroup}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={styles.checkbox}
                  onPress={() => handleDayToggle(day.key)}
                >
                  <MaterialIcons
                    name={formData.availableDays.includes(day.key) ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={formData.availableDays.includes(day.key) ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={styles.checkboxLabel}>{day.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Turno Preferido *</Text>
            <View style={styles.radioGroup}>
              {SHIFTS.map((shift) => (
                <TouchableOpacity
                  key={shift}
                  style={styles.radio}
                  onPress={() => setFormData(prev => ({ ...prev, shift }))}
                >
                  <MaterialIcons
                    name={formData.shift === shift ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={24}
                    color={formData.shift === shift ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={styles.radioLabel}>{shift}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Privilégio *</Text>
            <View style={styles.radioGroup}>
              {PRIVILEGES.map((privilege) => (
                <TouchableOpacity
                  key={privilege}
                  style={styles.radio}
                  onPress={() => setFormData(prev => ({ ...prev, privilege }))}
                >
                  <MaterialIcons
                    name={formData.privilege === privilege ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={24}
                    color={formData.privilege === privilege ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={styles.radioLabel}>{privilege}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <MaterialIcons name="send" size={20} color={COLORS.surface} />
            <Text style={styles.submitButtonText}>Enviar Inscrição</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  form: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  readOnlyInput: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  radioGroup: {
    gap: 12,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 16,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
  },
});