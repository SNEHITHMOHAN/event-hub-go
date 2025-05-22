
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
