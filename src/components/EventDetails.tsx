
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/types';
import { isUserAttending, isUserOrganizer } from '@/utils/eventUtils';

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
  onRsvp: () => void;
  onShare: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  event, 
  onBack, 
  onRsvp, 
  onShare 
}) => {
  const isAttending = isUserAttending(event);
  const isOrganizer = isUserOrganizer(event);
  
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  
  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-10 bg-background p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {event.imageUrl && (
        <div className="w-full h-60 relative">
          <img 
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        
        <div className="flex items-center mb-6">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={event.organizer?.avatar} />
            <AvatarFallback>{event.organizer?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Organized by</p>
            <p className="text-sm">{event.organizer?.name || "Unknown"}</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-3" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary mr-3" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary mr-3" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-primary mr-3" />
            <span>{event.attendees.length} / {event.capacity} attending</span>
          </div>
        </div>
        
        <div className="flex gap-2 mb-6">
          <Button 
            className="flex-1"
            variant={isAttending ? "outline" : "default"}
            onClick={onRsvp}
            disabled={isOrganizer}
          >
            {isAttending ? 'Cancel RSVP' : 'RSVP'}
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">About this event</h2>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        
        <Separator className="my-6" />
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
