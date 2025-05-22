
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Event } from '@/types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onRsvp: (event: Event) => void;
  title?: string;
  showSearch?: boolean;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  onEventClick, 
  onRsvp, 
  title = "Events", 
  showSearch = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {showSearch && (
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4"
          />
        )}
      </div>

      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
              onRsvp={() => onRsvp(event)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
