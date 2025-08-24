export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'volunteer';
  canCount: boolean;
}

export interface Volunteer {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  availableDays: string[];
  shift: string;
  privilege: string;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  resources: {
    microphone: boolean;
    sound: boolean;
    video: boolean;
    security: boolean;
  };
}

export interface CountEntry {
  id: string;
  userId: string;
  userEmail: string;
  day: 'friday' | 'saturday' | 'sunday';
  count: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

export interface AppState {
  user: User | null;
  volunteers: Volunteer[];
  sectors: Sector[];
  counts: CountEntry[];
  alerts: Alert[];
}