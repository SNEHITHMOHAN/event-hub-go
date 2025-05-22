
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  imageUrl?: string;
  organizerId: string;
  organizer?: User;
  attendees: string[]; // User IDs
  capacity: number;
  tags: string[];
  isPublic: boolean;
}

export interface EventFilters {
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

export enum TabType {
  EXPLORE = 'explore',
  MY_EVENTS = 'myEvents',
  CALENDAR = 'calendar',
  PROFILE = 'profile'
}

// Supabase specific interfaces to map database responses to our app models
export interface SupabaseEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string | null;
  organizer_id: string;
  capacity: number;
  tags: string[];
  is_public: boolean;
  created_at: string;
}

export interface SupabaseAttendee {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface SupabaseProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}
