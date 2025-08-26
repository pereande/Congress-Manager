import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, DAYS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
  const { user, volunteers, counts, sectors, refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
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
          <MaterialIcons name="analytics" size={64} color={COLORS.error} />
          <Text style={styles.accessDeniedTitle}>Dashboard Restrito</Text>
          <Text style={styles.accessDeniedText}>
            Esta seção é exclusiva para administradores.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Estatísticas calculadas
  const totalAttendance = counts.reduce((total, count) => total + count.count, 0);
  const totalVolunteers = volunteers.length;
  const volunteersByDay = DAYS.map(day => ({
    day: day.label,
    count: volunteers.filter(v => v.availableDays.includes(day.key)).length
  }));
  const assignedSectors = sectors.filter(s => s.assignedVolunteerId).length;
  const sectorsWithResources = sectors.filter(s => 
    Object.values(s.resources).some(r => r === true)
  ).length;

  // Contagem por dia
  const attendanceByDay = DAYS.map(day => ({
    day: day.label,
    count: counts.filter(c => c.day === day.key).reduce((sum, c) => sum + c.count, 0)
  }));

  // Privilégios dos voluntários
  const privilegeStats = volunteers.reduce((acc, v) => {
    acc[v.privilege] = (acc[v.privilege] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="analytics" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Dashboard Analítico</Text>
        <Text style={styles.subtitle}>Visão geral do congresso</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Geral</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total de Público"
              value={totalAttendance.toLocaleString()}
              subtitle="Pessoas contadas"
              icon="people"
              color={COLORS.primary}
            />
            <StatCard
              title="Voluntários"
              value={totalVolunteers}
              subtitle="Inscritos"
              icon="volunteer-activism"
              color={COLORS.success}
            />
            <StatCard
              title="Setores Designados"
              value={`${assignedSectors}/${sectors.length}`}
              subtitle="Com voluntários"
              icon="location-on"
              color={COLORS.accent}
            />
            <StatCard
              title="Setores Equipados"
              value={sectorsWithResources}
              subtitle="Com recursos"
              icon="settings"
              color={COLORS.warning}
            />
          </View>
        </View>

        {/* Público por Dia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Público por Dia</Text>
          <View style={styles.attendanceChart}>
            {attendanceByDay.map((item, index) => (
              <View key={item.day} style={styles.attendanceItem}>
                <View style={styles.attendanceBar}>
                  <View 
                    style={[
                      styles.attendanceFill,
                      { 
                        height: `${Math.max(10, (item.count / Math.max(1, totalAttendance)) * 100)}%`,
                        backgroundColor: [COLORS.primary, COLORS.success, COLORS.accent][index]
                      }
                    ]}
                  />
                </View>
                <Text style={styles.attendanceCount}>{item.count}</Text>
                <Text style={styles.attendanceDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Voluntários por Dia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidade de Voluntários</Text>
          <View style={styles.availabilityGrid}>
            {volunteersByDay.map((item, index) => (
              <StatCard
                key={item.day}
                title={item.day}
                value={item.count}
                subtitle="disponíveis"
                color={[COLORS.primary, COLORS.success, COLORS.accent][index]}
              />
            ))}
          </View>
        </View>

        {/* Distribuição por Privilégios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribuição por Privilégios</Text>
          <View style={styles.privilegesList}>
            {Object.entries(privilegeStats).map(([privilege, count]) => (
              <View key={privilege} style={styles.privilegeItem}>
                <View style={styles.privilegeInfo}>
                  <Text style={styles.privilegeName}>{privilege}</Text>
                  <Text style={styles.privilegeCount}>{count} voluntários</Text>
                </View>
                <View style={styles.privilegeBar}>
                  <View 
                    style={[
                      styles.privilegeFill,
                      { width: `${(count / totalVolunteers) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Atividade Recente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityList}>
            {counts.slice(0, 5).map((count) => (
              <View key={count.id} style={styles.activityItem}>
                <MaterialIcons name="add-circle" size={20} color={COLORS.success} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    Contagem de {count.count} pessoas em{' '}
                    {DAYS.find(d => d.key === count.day)?.label}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(count.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attendanceChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceBar: {
    height: 100,
    width: 30,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  attendanceFill: {
    width: '100%',
    borderRadius: 15,
  },
  attendanceCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  attendanceDay: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  availabilityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  privilegesList: {
    gap: 12,
  },
  privilegeItem: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  privilegeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  privilegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  privilegeCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  privilegeBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
  },
  privilegeFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  activityTime: {
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
  },
});