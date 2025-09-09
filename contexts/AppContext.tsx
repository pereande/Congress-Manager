import React, { createContext, ReactNode, useReducer, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, UserProfile, VolunteerData, SectorData, CountData, AlertData } from '@/services/supabase';
import { User, Volunteer, Sector, CountEntry, Alert, AppState } from '@/types';

interface AppContextType extends AppState {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  registerVolunteer: (volunteer: Omit<Volunteer, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSector: (sectorId: string, updates: Partial<Sector>) => Promise<void>;
  submitCount: (day: 'friday' | 'saturday' | 'sunday', count: number) => Promise<void>;
  updateUserPermission: (userId: string, canCount: boolean) => Promise<void>;
  sendAlert: (message: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_VOLUNTEERS'; payload: Volunteer[] }
  | { type: 'SET_SECTORS'; payload: Sector[] }
  | { type: 'SET_COUNTS'; payload: CountEntry[] }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'ADD_VOLUNTEER'; payload: Volunteer }
  | { type: 'UPDATE_SECTOR'; payload: { id: string; updates: Partial<Sector> } }
  | { type: 'ADD_COUNT'; payload: CountEntry }
  | { type: 'ADD_ALERT'; payload: Alert };

const initialState: AppState & { session: Session | null; loading: boolean } = {
  session: null,
  user: null,
  volunteers: [],
  sectors: [],
  counts: [],
  alerts: [],
  loading: true,
};

function appReducer(
  state: AppState & { session: Session | null; loading: boolean },
  action: AppAction
): AppState & { session: Session | null; loading: boolean } {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_VOLUNTEERS':
      return { ...state, volunteers: action.payload };
    case 'SET_SECTORS':
      return { ...state, sectors: action.payload };
    case 'SET_COUNTS':
      return { ...state, counts: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'ADD_VOLUNTEER':
      return { ...state, volunteers: [...state.volunteers, action.payload] };
    case 'UPDATE_SECTOR':
      return {
        ...state,
        sectors: state.sectors.map(sector =>
          sector.id === action.payload.id
            ? { ...sector, ...action.payload.updates }
            : sector
        ),
      };
    case 'ADD_COUNT':
      return { ...state, counts: [...state.counts, action.payload] };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    default:
      return state;
  }
}

// Transform functions
const transformUserProfile = (profile: UserProfile): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.name,
  role: profile.role,
  canCount: profile.can_count,
});

const transformVolunteer = (volunteer: VolunteerData): Volunteer => ({
  id: volunteer.id,
  userId: volunteer.user_id,
  fullName: volunteer.full_name,
  email: volunteer.email,
  availableDays: volunteer.available_days,
  shift: volunteer.shift,
  privilege: volunteer.privilege,
  createdAt: volunteer.created_at,
});

const transformSector = (sector: SectorData): Sector => ({
  id: sector.id,
  name: sector.name,
  assignedVolunteerId: sector.assigned_volunteer_id,
  assignedVolunteerName: sector.assigned_volunteer_name,
  resources: sector.resources,
});

const transformCount = (count: CountData): CountEntry => ({
  id: count.id,
  userId: count.user_id,
  userEmail: count.user_email,
  day: count.day,
  count: count.count,
  timestamp: count.timestamp,
});

const transformAlert = (alert: AlertData): Alert => ({
  id: alert.id,
  message: alert.message,
  createdBy: alert.created_by_email,
  createdAt: alert.created_at,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_SESSION', payload: session });
      if (session?.user) {
        loadUserProfile(session.user);
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      dispatch({ type: 'SET_SESSION', payload: session });
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (state.user) {
      loadAllData();
      setupRealTimeSubscriptions();
    }
  }, [state.user]);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        dispatch({ type: 'SET_USER', payload: transformUserProfile(profile) });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadAllData = async () => {
    try {
      const [volunteersResult, sectorsResult, countsResult, alertsResult] = await Promise.all([
        supabase.from('volunteers').select('*').order('created_at', { ascending: false }),
        supabase.from('sectors').select('*').order('name'),
        supabase.from('counts').select('*').order('timestamp', { ascending: false }),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (volunteersResult.data) {
        dispatch({
          type: 'SET_VOLUNTEERS',
          payload: volunteersResult.data.map(transformVolunteer),
        });
      }

      if (sectorsResult.data) {
        dispatch({
          type: 'SET_SECTORS',
          payload: sectorsResult.data.map(transformSector),
        });
      }

      if (countsResult.data) {
        dispatch({
          type: 'SET_COUNTS',
          payload: countsResult.data.map(transformCount),
        });
      }

      if (alertsResult.data) {
        dispatch({
          type: 'SET_ALERTS',
          payload: alertsResult.data.map(transformAlert),
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to volunteers changes
    const volunteersSubscription = supabase
      .channel('volunteers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'volunteers',
      }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          dispatch({ 
            type: 'ADD_VOLUNTEER', 
            payload: transformVolunteer(payload.new as VolunteerData) 
          });
        }
      })
      .subscribe();

    // Subscribe to sectors changes
    const sectorsSubscription = supabase
      .channel('sectors_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sectors',
      }, (payload) => {
        if (payload.new) {
          const sectorData = payload.new as SectorData;
          dispatch({ 
            type: 'UPDATE_SECTOR', 
            payload: { 
              id: sectorData.id, 
              updates: {
                assignedVolunteerId: sectorData.assigned_volunteer_id,
                assignedVolunteerName: sectorData.assigned_volunteer_name,
                resources: sectorData.resources,
              }
            } 
          });
        }
      })
      .subscribe();

    // Subscribe to counts changes
    const countsSubscription = supabase
      .channel('counts_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'counts',
      }, (payload) => {
        if (payload.new) {
          dispatch({ 
            type: 'ADD_COUNT', 
            payload: transformCount(payload.new as CountData) 
          });
        }
      })
      .subscribe();

    // Subscribe to alerts changes
    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
      }, (payload) => {
        if (payload.new) {
          dispatch({ 
            type: 'ADD_ALERT', 
            payload: transformAlert(payload.new as AlertData) 
          });
        }
      })
      .subscribe();

    // Cleanup function
    return () => {
      volunteersSubscription.unsubscribe();
      sectorsSubscription.unsubscribe();
      countsSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  };

  // Auth methods
    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('❌ Auth error:', error.message);
        
        // Traduzir erros comuns
        let errorMessage = error.message;
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique seus dados.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (errorMessage.includes('Network request failed')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        
        return { success: false, error: errorMessage };
      }

      console.log('✅ Sign in successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Network error during sign in:', error);
      
      let errorMessage = 'Erro de conexão';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Data methods
  const registerVolunteer = async (volunteerData: Omit<Volunteer, 'id' | 'userId' | 'createdAt'>): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('volunteers')
        .insert({
          user_id: state.user.id,
          full_name: volunteerData.fullName,
          email: volunteerData.email,
          available_days: volunteerData.availableDays,
          shift: volunteerData.shift,
          privilege: volunteerData.privilege,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registering volunteer:', error);
      throw error;
    }
  };

  const updateSector = async (sectorId: string, updates: Partial<Sector>): Promise<void> => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.assignedVolunteerId !== undefined) {
        updateData.assigned_volunteer_id = updates.assignedVolunteerId || null;
      }
      if (updates.assignedVolunteerName !== undefined) {
        updateData.assigned_volunteer_name = updates.assignedVolunteerName || null;
      }
      if (updates.resources) {
        updateData.resources = updates.resources;
      }

      const { error } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', sectorId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating sector:', error);
      throw error;
    }
  };

  const submitCount = async (day: 'friday' | 'saturday' | 'sunday', count: number): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('counts')
        .insert({
          user_id: state.user.id,
          user_email: state.user.email,
          day,
          count,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting count:', error);
      throw error;
    }
  };

  const updateUserPermission = async (userId: string, canCount: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          can_count: canCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data to get updated permissions
      await loadAllData();
    } catch (error) {
      console.error('Error updating user permission:', error);
      throw error;
    }
  };

  const sendAlert = async (message: string): Promise<void> => {
    if (!state.user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          message: message.trim(),
          created_by: state.user.id,
          created_by_email: state.user.email,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  };

  const refreshData = async (): Promise<void> => {
    if (state.user) {
      await loadAllData();
    }
  };

  const value: AppContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    registerVolunteer,
    updateSector,
    submitCount,
    updateUserPermission,
    sendAlert,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}