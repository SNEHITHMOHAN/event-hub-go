
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import EventList from '@/components/EventList';
import EventDetails from '@/components/EventDetails';
import CreateEventModal from '@/components/CreateEventModal';
import UserProfile from '@/components/UserProfile';
import { Event, TabType } from '@/types';
import { mockEvents, getEventsWithDetails, getEventsForUser, currentUser } from '@/data/events';
import { toggleAttendance } from '@/utils/eventUtils';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.EXPLORE);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Load events on initial render
  useEffect(() => {
    if (activeTab === TabType.EXPLORE) {
      const allEvents = getEventsWithDetails();
      setEvents(allEvents);
    } else if (activeTab === TabType.MY_EVENTS) {
      const userEvents = getEventsForUser(currentUser.id);
      setEvents(userEvents);
    }
  }, [activeTab]);
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };
  
  const handleRsvp = (event: Event) => {
    const updatedEvent = toggleAttendance(event);
    
    // Update events state with the new attendance info
    setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    
    // If we're viewing the event details, update the selected event too
    if (selectedEvent && selectedEvent.id === event.id) {
      setSelectedEvent(updatedEvent);
    }
    
    // Show a toast notification
    const isAttending = updatedEvent.attendees.includes(currentUser.id);
    toast({
      title: isAttending ? "You're going!" : "RSVP cancelled",
      description: isAttending ? `You've successfully RSVP'd to ${event.title}` : `You've cancelled your RSVP to ${event.title}`,
    });
  };
  
  const handleCreateEvent = (newEventData: Omit<Event, 'id'>) => {
    const newId = (mockEvents.length + 1).toString();
    const newEvent: Event = {
      id: newId,
      ...newEventData,
    };
    
    // Add to events
    setEvents([newEvent, ...events]);
    
    toast({
      title: "Event created!",
      description: `${newEvent.title} has been created successfully.`,
    });
  };
  
  const handleShare = () => {
    if (selectedEvent) {
      // In a real app, this would use the Web Share API or copy a link
      toast({
        title: "Share event",
        description: `Link to ${selectedEvent.title} copied to clipboard!`,
      });
    }
  };
  
  // Render event details view if an event is selected
  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-background">
        <EventDetails 
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
          onRsvp={() => handleRsvp(selectedEvent)}
          onShare={handleShare}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Eventify</h1>
        {activeTab !== TabType.PROFILE && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        )}
      </header>
      
      <main className="container mx-auto px-4 pt-4">
        {activeTab === TabType.EXPLORE && (
          <EventList 
            events={events} 
            onEventClick={handleEventClick}
            onRsvp={handleRsvp}
            title="Discover Events"
          />
        )}
        
        {activeTab === TabType.MY_EVENTS && (
          <EventList 
            events={events} 
            onEventClick={handleEventClick}
            onRsvp={handleRsvp}
            title="My Events"
          />
        )}
        
        {activeTab === TabType.PROFILE && (
          <UserProfile 
            events={events}
            onCreateEvent={() => setIsCreateModalOpen(true)}
            onEventClick={handleEventClick}
            onRsvp={handleRsvp}
          />
        )}
      </main>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default Index;
