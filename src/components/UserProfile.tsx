
import React from 'react';
import { User, Event } from '@/types';
import { currentUser } from '@/data/events';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import EventCard from './EventCard';
import { Calendar, Plus } from 'lucide-react';

interface UserProfileProps {
  user?: User;
  events: Event[];
  onCreateEvent: () => void;
  onEventClick: (event: Event) => void;
  onRsvp: (event: Event) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user = currentUser, 
  events,
  onCreateEvent,
  onEventClick,
  onRsvp
}) => {
  const organizedEvents = events.filter(event => event.organizerId === user.id);
  const attendingEvents = events.filter(
    event => event.attendees.includes(user.id) && event.organizerId !== user.id
  );

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col items-center pt-8 pb-6">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
        <p className="text-muted-foreground mb-4">{user.email}</p>
        <Button onClick={onCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      </div>

      <div className="px-4 mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Your Events ({organizedEvents.length})</h2>
        </div>
        
        {organizedEvents.length > 0 ? (
          <div className="space-y-4">
            {organizedEvents.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
                onRsvp={() => onRsvp(event)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            You haven't created any events yet.
          </p>
        )}
      </div>

      <div className="px-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Attending ({attendingEvents.length})
        </h2>
        
        {attendingEvents.length > 0 ? (
          <div className="space-y-4">
            {attendingEvents.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
                onRsvp={() => onRsvp(event)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            You're not attending any events yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
