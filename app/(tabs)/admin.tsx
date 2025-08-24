import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { useCustomAlert, CustomAlert } from '@/components/ui/CustomAlert';
import { supabase } from '@/services/supabase';

export default function AdminPage() {
  const { user, volunteers, updateUserPermission, sendAlert, signOut, refreshData } = useApp();
  const { alertConfig, setAlertConfig, showAlert } = useCustomAlert();
  const [alertMessage, setAlertMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUserProfiles();
    }
  }, [user]);

  const loadUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      await loadUserProfiles();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.accessDenied}>
          <MaterialIcons name="admin-panel-settings" size={64} color={COLORS.error} />
          <Text style={styles.accessDeniedTitle}>Acesso Restrito</Text>
          <Text style={styles.accessDeniedText}>
            Esta seção é exclusiva para administradores.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePermissionToggle = async (userId: string, currentPermission: boolean) => {
    try {
      await updateUserPermission(userId, !currentPermission);
      await loadUserProfiles(); // Reload to get updated data
      showAlert('Sucesso', `Permissão ${!currentPermission ? 'concedida' : 'removida'} com sucesso!`);
    } catch (error) {
      showAlert('Erro', 'Erro ao atualizar permissão. Tente novamente.');
    }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) {
      showAlert('Erro', 'Por favor, digite uma mensagem para o alerta.');
      return;
    }

    try {
      await sendAlert(alertMessage.trim());
      setAlertMessage('');
      showAlert('Sucesso', 'Alerta enviado com sucesso!');
    } catch (error) {
      showAlert('Erro', 'Erro ao enviar alerta. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      showAlert('Erro', 'Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="admin-panel-settings" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Painel Administrativo</Text>
        <Text style={styles.subtitle}>Gerenciar permissões e alertas</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Usuário</Text>
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>Administrador</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Alert */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enviar Alerta Global</Text>
          <View style={styles.alertForm}>
            <TextInput
              style={styles.alertInput}
              value={alertMessage}
              onChangeText={setAlertMessage}
              placeholder="Digite a mensagem do alerta..."
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendAlert}>
              <MaterialIcons name="send" size={20} color={COLORS.surface} />
              <Text style={styles.sendButtonText}>Enviar Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Permissions Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar Permissões</Text>
          <Text style={styles.sectionSubtitle}>
            Conceda ou remova permissões de contagem para usuários
          </Text>
          
          {userProfiles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="group-off" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
            </View>
          ) : (
            <View style={styles.permissionsList}>
              {userProfiles.map((profile) => (
                <View key={profile.id} style={styles.permissionCard}>
                  <View style={styles.volunteerInfo}>
                    <Text style={styles.volunteerName}>{profile.name}</Text>
                    <Text style={styles.volunteerEmail}>{profile.email}</Text>
                    <Text style={styles.volunteerRole}>
                      {profile.role === 'admin' ? 'Administrador' : 'Voluntário'}
                    </Text>
                  </View>
                  <View style={styles.permissionToggle}>
                    <Text style={styles.permissionLabel}>Contagem</Text>
                    <Switch
                      value={profile.can_count}
                      onValueChange={() => handlePermissionToggle(profile.id, profile.can_count)}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor={COLORS.surface}
                      disabled={profile.role === 'admin'} // Admins always have permission
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas Rápidas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{volunteers.length}</Text>
              <Text style={styles.statLabel}>Voluntários</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="person" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{userProfiles.length}</Text>
              <Text style={styles.statLabel}>Usuários</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="verified-user" size={24} color={COLORS.accent} />
              <Text style={styles.statNumber}>
                {userProfiles.filter(p => p.can_count).length}
              </Text>
              <Text style={styles.statLabel}>Com Permissão</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {},
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  logoutButtonText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  alertForm: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  permissionsList: {
    gap: 12,
  },
  permissionCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  volunteerEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  volunteerRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  permissionToggle: {
    alignItems: 'center',
    gap: 4,
  },
  permissionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
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