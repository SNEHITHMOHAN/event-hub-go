
import { Event, EventFilters } from '../types';
import { mockEvents, mockUsers, currentUser } from '../data/events';

// Format date in a human-readable format
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Calculate days remaining until an event
export const getDaysRemaining = (dateString: string): number => {
  const eventDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = eventDate.getTime() - currentDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference;
};

// Check if user is attending an event
export const isUserAttending = (event: Event, userId: string = currentUser.id): boolean => {
  return event.attendees.includes(userId);
};

// Check if user is organizing an event
export const isUserOrganizer = (event: Event, userId: string = currentUser.id): boolean => {
  return event.organizerId === userId;
};

// Get attendees with details
export const getEventAttendees = (event: Event) => {
  return event.attendees.map(attendeeId => 
    mockUsers.find(user => user.id === attendeeId)
  ).filter(Boolean);
};

// Filter events based on criteria
export const filterEvents = (events: Event[], filters: EventFilters): Event[] => {
  return events.filter(event => {
    // Search term filter
    if (filters.searchTerm && !event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !event.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0 && 
        !filters.tags.some(tag => event.tags.includes(tag))) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const eventDate = new Date(event.date);
      if (filters.dateRange.start && eventDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && eventDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
};

// Get upcoming events
export const getUpcomingEvents = (events: Event[], limit?: number): Event[] => {
  const now = new Date();
  const upcoming = events
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
};

// Toggle user attendance for an event
export const toggleAttendance = (event: Event, userId: string = currentUser.id): Event => {
  const isAttending = event.attendees.includes(userId);
  
  let updatedAttendees;
  if (isAttending) {
    updatedAttendees = event.attendees.filter(id => id !== userId);
  } else {
    updatedAttendees = [...event.attendees, userId];
  }
  
  return {
    ...event,
    attendees: updatedAttendees
  };
};
