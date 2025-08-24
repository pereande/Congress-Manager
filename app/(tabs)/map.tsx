import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { Sector } from '@/types';
import { useCustomAlert, CustomAlert } from '@/components/ui/CustomAlert';

export default function MapPage() {
  const { user, sectors, volunteers, updateSector } = useApp();
  const { alertConfig, setAlertConfig, showAlert } = useCustomAlert();
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSectorPress = (sector: Sector) => {
    setSelectedSector(sector);
    if (user?.role === 'admin') {
      setEditModalVisible(true);
    }
  };

  const handleAssignVolunteer = async (volunteerId: string) => {
    if (!selectedSector) return;

    const volunteer = volunteers.find(v => v.id === volunteerId);
    try {
      await updateSector(selectedSector.id, {
        assignedVolunteerId: volunteerId,
        assignedVolunteerName: volunteer?.fullName,
      });
      setEditModalVisible(false);
      showAlert('Sucesso', 'Voluntário designado com sucesso!');
    } catch (error) {
      showAlert('Erro', 'Erro ao designar voluntário. Tente novamente.');
    }
  };

  const handleResourceToggle = async (resource: keyof Sector['resources']) => {
    if (!selectedSector) return;

    try {
      await updateSector(selectedSector.id, {
        resources: {
          ...selectedSector.resources,
          [resource]: !selectedSector.resources[resource],
        },
      });
    } catch (error) {
      showAlert('Erro', 'Erro ao atualizar recurso. Tente novamente.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="map" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Mapa de Setores</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'admin' ? 'Toque em um setor para editar' : 'Visualização dos setores do local'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectorsGrid}>
          {sectors.map((sector) => (
            <TouchableOpacity
              key={sector.id}
              style={[
                styles.sectorCard,
                sector.assignedVolunteerId && styles.sectorCardAssigned,
              ]}
              onPress={() => handleSectorPress(sector)}
            >
              <Text style={styles.sectorName}>{sector.name}</Text>
              {sector.assignedVolunteerName && (
                <Text style={styles.volunteerName}>{sector.assignedVolunteerName}</Text>
              )}
              <View style={styles.resourcesRow}>
                {sector.resources.microphone && (
                  <MaterialIcons name="mic" size={16} color={COLORS.primary} />
                )}
                {sector.resources.sound && (
                  <MaterialIcons name="volume-up" size={16} color={COLORS.primary} />
                )}
                {sector.resources.video && (
                  <MaterialIcons name="videocam" size={16} color={COLORS.primary} />
                )}
                {sector.resources.security && (
                  <MaterialIcons name="security" size={16} color={COLORS.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar {selectedSector?.name}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Designar Voluntário</Text>
                <TouchableOpacity
                  style={styles.volunteerButton}
                  onPress={() => handleAssignVolunteer('')}
                >
                  <Text style={styles.volunteerButtonText}>Remover Designação</Text>
                </TouchableOpacity>
                {volunteers.map((volunteer) => (
                  <TouchableOpacity
                    key={volunteer.id}
                    style={[
                      styles.volunteerButton,
                      selectedSector?.assignedVolunteerId === volunteer.id && styles.volunteerButtonSelected,
                    ]}
                    onPress={() => handleAssignVolunteer(volunteer.id)}
                  >
                    <Text style={[
                      styles.volunteerButtonText,
                      selectedSector?.assignedVolunteerId === volunteer.id && styles.volunteerButtonTextSelected,
                    ]}>
                      {volunteer.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recursos no Setor</Text>
                <View style={styles.resourcesList}>
                  {[
                    { key: 'microphone', label: 'Microfone', icon: 'mic' },
                    { key: 'sound', label: 'Som', icon: 'volume-up' },
                    { key: 'video', label: 'Vídeo', icon: 'videocam' },
                    { key: 'security', label: 'Segurança', icon: 'security' },
                  ].map(({ key, label, icon }) => (
                    <TouchableOpacity
                      key={key}
                      style={styles.resourceItem}
                      onPress={() => handleResourceToggle(key as keyof Sector['resources'])}
                    >
                      <MaterialIcons
                        name={selectedSector?.resources[key as keyof Sector['resources']] ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={selectedSector?.resources[key as keyof Sector['resources']] ? COLORS.primary : COLORS.textSecondary}
                      />
                      <MaterialIcons name={icon as any} size={20} color={COLORS.textSecondary} />
                      <Text style={styles.resourceLabel}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    padding: 16,
  },
  sectorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectorCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
  },
  sectorCardAssigned: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  sectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  volunteerName: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  volunteerButton: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  volunteerButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  volunteerButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  volunteerButtonTextSelected: {
    color: COLORS.surface,
  },
  resourcesList: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  resourceLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});