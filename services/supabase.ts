import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Configured' : '❌ Missing');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Configured' : '❌ Missing');
  throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
}

console.log('✅ Supabase configuration loaded');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'gestor-congresso',
    },
  },
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  } else {
    console.log('✅ Supabase connection test successful');
  }
}).catch(err => {
  console.error('❌ Network error during Supabase connection test:', err);
});

// Handle app state changes for auth
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'volunteer';
          can_count: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'volunteer';
          can_count?: boolean;
        };
        Update: {
          name?: string;
          role?: 'admin' | 'volunteer';
          can_count?: boolean;
          updated_at?: string;
        };
      };
      volunteers: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          available_days: string[];
          shift: string;
          privilege: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          email: string;
          available_days: string[];
          shift: string;
          privilege: string;
        };
        Update: {
          full_name?: string;
          available_days?: string[];
          shift?: string;
          privilege?: string;
        };
      };
      sectors: {
        Row: {
          id: string;
          name: string;
          assigned_volunteer_id?: string;
          assigned_volunteer_name?: string;
          resources: {
            microphone: boolean;
            sound: boolean;
            video: boolean;
            security: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Update: {
          assigned_volunteer_id?: string;
          assigned_volunteer_name?: string;
          resources?: {
            microphone: boolean;
            sound: boolean;
            video: boolean;
            security: boolean;
          };
          updated_at?: string;
        };
      };
      counts: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          day: 'friday' | 'saturday' | 'sunday';
          count: number;
          timestamp: string;
        };
        Insert: {
          user_id: string;
          user_email: string;
          day: 'friday' | 'saturday' | 'sunday';
          count: number;
        };
      };
      alerts: {
        Row: {
          id: string;
          message: string;
          created_by: string;
          created_by_email: string;
          created_at: string;
        };
        Insert: {
          message: string;
          created_by: string;
          created_by_email: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type VolunteerData = Database['public']['Tables']['volunteers']['Row'];
export type SectorData = Database['public']['Tables']['sectors']['Row'];
export type CountData = Database['public']['Tables']['counts']['Row'];
export type AlertData = Database['public']['Tables']['alerts']['Row'];