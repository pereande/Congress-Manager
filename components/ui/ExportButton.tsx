import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS } from '@/constants';
import { useApp } from '@/hooks/useApp';
import { useCustomAlert } from '@/components/ui/CustomAlert';

interface ExportButtonProps {
  type: 'volunteers' | 'counts' | 'sectors' | 'full';
}

export function ExportButton({ type }: ExportButtonProps) {
  const { volunteers, counts, sectors } = useApp();
  const { showAlert } = useCustomAlert();
  const [exporting, setExporting] = useState(false);

  const generateCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.join(',');
    const csvData = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    ).join('\n');
    
    return `${csvHeaders}\n${csvData}`;
  };

  const exportVolunteers = () => {
    const data = volunteers.map(v => ({
      'Nome Completo': v.fullName,
      'Email': v.email,
      'Dias Disponíveis': v.availableDays.join('; '),
      'Turno': v.shift,
      'Privilégio': v.privilege,
      'Data de Inscrição': new Date(v.createdAt).toLocaleDateString('pt-BR')
    }));

    return generateCSV(data, [
      'Nome Completo', 'Email', 'Dias Disponíveis', 'Turno', 'Privilégio', 'Data de Inscrição'
    ]);
  };

  const exportCounts = () => {
    const data = counts.map(c => ({
      'Email do Usuário': c.userEmail,
      'Dia': c.day === 'friday' ? 'Sexta-feira' : c.day === 'saturday' ? 'Sábado' : 'Domingo',
      'Contagem': c.count,
      'Data/Hora': new Date(c.timestamp).toLocaleString('pt-BR')
    }));

    return generateCSV(data, [
      'Email do Usuário', 'Dia', 'Contagem', 'Data/Hora'
    ]);
  };

  const exportSectors = () => {
    const data = sectors.map(s => ({
      'Setor': s.name,
      'Voluntário Designado': s.assignedVolunteerName || 'Não designado',
      'Microfone': s.resources.microphone ? 'Sim' : 'Não',
      'Som': s.resources.sound ? 'Sim' : 'Não',
      'Vídeo': s.resources.video ? 'Sim' : 'Não',
      'Segurança': s.resources.security ? 'Sim' : 'Não'
    }));

    return generateCSV(data, [
      'Setor', 'Voluntário Designado', 'Microfone', 'Som', 'Vídeo', 'Segurança'
    ]);
  };

  const exportFull = () => {
    const volunteersCsv = exportVolunteers();
    const countsCsv = exportCounts();
    const sectorsCsv = exportSectors();

    return `VOLUNTÁRIOS INSCRITOS\n${volunteersCsv}\n\n\nCONTAGENS DE PÚBLICO\n${countsCsv}\n\n\nSETORES E RECURSOS\n${sectorsCsv}`;
  };

  const handleExport = async () => {
    if (Platform.OS === 'web') {
      showAlert('Não Disponível', 'Exportação não disponível na versão web. Use um dispositivo móvel.');
      return;
    }

    setExporting(true);
    
    try {
      let content = '';
      let filename = '';

      switch (type) {
        case 'volunteers':
          content = exportVolunteers();
          filename = 'voluntarios_congresso.csv';
          break;
        case 'counts':
          content = exportCounts();
          filename = 'contagem_publico.csv';
          break;
        case 'sectors':
          content = exportSectors();
          filename = 'setores_recursos.csv';
          break;
        case 'full':
          content = exportFull();
          filename = 'relatorio_completo_congresso.txt';
          break;
      }

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        showAlert('Sucesso', `Arquivo salvo em: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert('Erro', 'Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const getButtonText = () => {
    if (exporting) return 'Exportando...';
    
    switch (type) {
      case 'volunteers': return 'Exportar Voluntários';
      case 'counts': return 'Exportar Contagens';
      case 'sectors': return 'Exportar Setores';
      case 'full': return 'Exportar Tudo';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, exporting && styles.buttonDisabled]} 
      onPress={handleExport}
      disabled={exporting}
    >
      <MaterialIcons 
        name={exporting ? 'hourglass-empty' : 'download'} 
        size={20} 
        color={COLORS.surface} 
      />
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});