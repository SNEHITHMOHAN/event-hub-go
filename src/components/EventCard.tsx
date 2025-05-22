
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { formatEventDate, isUserAttending } from '@/utils/eventUtils';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  onRsvp: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, onRsvp }) => {
  const isAttending = isUserAttending(event);
  
  const handleRsvpClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick of parent
    onRsvp();
  };

  return (
    <Card 
      className="mb-4 overflow-hidden card-hover cursor-pointer" 
      onClick={onClick}
    >
      {event.imageUrl && (
        <div className="w-full h-48 relative">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <Calendar size={16} className="text-primary mr-2" />
          <span className="text-sm text-muted-foreground">
            {formatEventDate(event.date)} • {event.time}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{event.location}</p>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={event.organizer?.avatar} />
            <AvatarFallback>{event.organizer?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">
            by {event.organizer?.name || "Unknown"}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {event.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{event.attendees.length}</span>
            <span className="text-muted-foreground"> / {event.capacity} attending</span>
          </div>
          
          <Button
            variant={isAttending ? "outline" : "default"}
            size="sm"
            onClick={handleRsvpClick}
          >
            {isAttending ? 'Cancel RSVP' : 'RSVP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
