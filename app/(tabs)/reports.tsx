import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, DAYS } from '@/constants';
import { useApp } from '@/hooks/useApp';

export default function ReportsPage() {
  const { volunteers, counts } = useApp();

  const getCountByDay = (day: string) => {
    return counts
      .filter(count => count.day === day)
      .reduce((total, count) => total + count.count, 0);
  };

  const totalAttendance = counts.reduce((total, count) => total + count.count, 0);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="bar-chart" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>Resumo geral do evento</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Attendance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contagem Geral</Text>
          <View style={styles.attendanceGrid}>
            {DAYS.map((day) => {
              const dayCount = getCountByDay(day.key);
              return (
                <View key={day.key} style={styles.attendanceCard}>
                  <Text style={styles.attendanceDay}>{day.label}</Text>
                  <Text style={styles.attendanceCount}>{dayCount}</Text>
                  <Text style={styles.attendanceLabel}>pessoas</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Geral</Text>
            <Text style={styles.totalCount}>{totalAttendance}</Text>
          </View>
        </View>

        {/* Volunteers Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voluntários Inscritos</Text>
          <View style={styles.volunteersStats}>
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{volunteers.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.volunteersList}>
            {volunteers.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="group-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Nenhum voluntário inscrito ainda</Text>
              </View>
            ) : (
              volunteers.map((volunteer) => (
                <View key={volunteer.id} style={styles.volunteerCard}>
                  <View style={styles.volunteerHeader}>
                    <Text style={styles.volunteerName}>{volunteer.fullName}</Text>
                    <Text style={styles.volunteerEmail}>{volunteer.email}</Text>
                  </View>
                  <View style={styles.volunteerDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{volunteer.shift}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>
                        {volunteer.availableDays.map(day => 
                          DAYS.find(d => d.key === day)?.label
                        ).join(', ')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="star" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{volunteer.privilege}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Count Details */}
        {counts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes das Contagens</Text>
            <View style={styles.countsList}>
              {counts.map((count) => (
                <View key={count.id} style={styles.countCard}>
                  <View style={styles.countHeader}>
                    <Text style={styles.countDay}>
                      {DAYS.find(d => d.key === count.day)?.label}
                    </Text>
                    <Text style={styles.countNumber}>{count.count}</Text>
                  </View>
                  <Text style={styles.countUser}>Por: {count.userEmail}</Text>
                  <Text style={styles.countTime}>
                    {new Date(count.timestamp).toLocaleString('pt-BR')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    marginBottom: 16,
  },
  attendanceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attendanceDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  attendanceCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  attendanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  volunteersStats: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  volunteersList: {
    gap: 12,
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
  volunteerCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  volunteerHeader: {
    marginBottom: 12,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  volunteerEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  volunteerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
  },
  countsList: {
    gap: 12,
  },
  countCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countDay: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  countUser: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  countTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});