
import { Event, User } from '../types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Sam Rodriguez',
    email: 'sam@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Jamie Smith',
    email: 'jamie@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Taylor Williams',
    email: 'taylor@example.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
  }
];

// Current mock user (as if logged in)
export const currentUser: User = mockUsers[0];

// Mock events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'Join us for the largest tech conference of the year featuring keynote speakers, workshops, and networking opportunities.',
    date: '2025-06-15',
    time: '09:00 AM',
    location: 'Convention Center, New York',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop',
    organizerId: '2',
    attendees: ['1', '3', '4'],
    capacity: 500,
    tags: ['Technology', 'Conference', 'Networking'],
    isPublic: true,
  },
  {
    id: '2',
    title: 'Community Yoga Session',
    description: 'Relax and rejuvenate with our community yoga session. All skill levels welcome!',
    date: '2025-05-28',
    time: '07:30 AM',
    location: 'Central Park, West Side',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2940&auto=format&fit=crop',
    organizerId: '3',
    attendees: ['1', '4'],
    capacity: 30,
    tags: ['Fitness', 'Wellness', 'Outdoor'],
    isPublic: true,
  },
  {
    id: '3',
    title: 'Design Workshop',
    description: 'Learn the fundamentals of UX/UI design in this hands-on workshop led by industry professionals.',
    date: '2025-06-05',
    time: '02:00 PM',
    location: 'Creative Studio, San Francisco',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2940&auto=format&fit=crop',
    organizerId: '1',
    attendees: ['2', '3'],
    capacity: 20,
    tags: ['Design', 'Workshop', 'Creative'],
    isPublic: true,
  },
  {
    id: '4',
    title: 'Music Festival',
    description: 'A two-day music festival featuring local and international artists across multiple genres.',
    date: '2025-07-10',
    time: '12:00 PM',
    location: 'Riverside Park, Austin',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2940&auto=format&fit=crop',
    organizerId: '4',
    attendees: ['1', '2', '3'],
    capacity: 1000,
    tags: ['Music', 'Festival', 'Entertainment'],
    isPublic: true,
  },
  {
    id: '5',
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to investors and receive feedback.',
    date: '2025-06-20',
    time: '06:00 PM',
    location: 'Innovation Hub, Boston',
    imageUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2940&auto=format&fit=crop',
    organizerId: '2',
    attendees: ['1'],
    capacity: 50,
    tags: ['Business', 'Startup', 'Networking'],
    isPublic: true,
  },
  {
    id: '6',
    title: 'Cooking Class: Italian Cuisine',
    description: 'Learn to cook authentic Italian dishes with our expert chef in this hands-on cooking class.',
    date: '2025-06-08',
    time: '03:00 PM',
    location: 'Culinary Institute, Chicago',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2940&auto=format&fit=crop',
    organizerId: '3',
    attendees: ['2', '4'],
    capacity: 15,
    tags: ['Cooking', 'Food', 'Learning'],
    isPublic: true,
  },
];

// Helper function to get events with organizer details
export const getEventsWithDetails = () => {
  return mockEvents.map(event => ({
    ...event,
    organizer: mockUsers.find(user => user.id === event.organizerId)
  }));
};

// Helper function to get events for a specific user (organized or attending)
export const getEventsForUser = (userId: string, includeAttending = true) => {
  let userEvents = mockEvents.filter(event => event.organizerId === userId);
  
  if (includeAttending) {
    const attendingEvents = mockEvents.filter(event => 
      event.attendees.includes(userId) && event.organizerId !== userId
    );
    userEvents = [...userEvents, ...attendingEvents];
  }
  
  return userEvents.map(event => ({
    ...event,
    organizer: mockUsers.find(user => user.id === event.organizerId)
  }));
};
