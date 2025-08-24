export const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#7c3aed',
};

export const PRIVILEGES = [
  'Ancião',
  'Servo Ministerial',
  'Pioneiro Regular',
  'Pioneiro Auxiliar',
  'Publicador',
];

export const SHIFTS = [
  'Manhã (8h-12h)',
  'Tarde (13h-17h)',
  'Noite (18h-22h)',
];

export const DAYS = [
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const ADMIN_EMAIL = 'admin@congresso.org';

export const INITIAL_SECTORS = Array.from({ length: 20 }, (_, i) => ({
  id: `sector-${i + 1}`,
  name: `Setor ${String.fromCharCode(65 + i)}`,
  resources: {
    microphone: false,
    sound: false,
    video: false,
    security: false,
  },
}));