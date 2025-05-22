
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import EventList from '@/components/EventList';
import EventDetails from '@/components/EventDetails';
import CreateEventModal from '@/components/CreateEventModal';
import UserProfile from '@/components/UserProfile';
import { Event, TabType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchPublicEvents, 
  fetchUserEvents, 
  fetchAttendingEvents, 
  toggleEventAttendance, 
  createEvent 
} from '@/services/eventService';

const Index = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.EXPLORE);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Redirect to auth page if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // Load events based on active tab
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      try {
        let loadedEvents: Event[] = [];
        
        if (activeTab === TabType.EXPLORE) {
          loadedEvents = await fetchPublicEvents();
        } else if (activeTab === TabType.MY_EVENTS && user) {
          loadedEvents = await fetchUserEvents(user.id);
        } else if (activeTab === TabType.CALENDAR && user) {
          // For now, Calendar tab shows events user is attending
          loadedEvents = await fetchAttendingEvents(user.id);
        }
        
        setEvents(loadedEvents);
      } catch (error) {
        console.error("Error loading events:", error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingEvents(false);
      }
    };
    
    if (isAuthenticated) {
      loadEvents();
    }
  }, [activeTab, isAuthenticated, user]);
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };
  
  const handleRsvp = async (event: Event) => {
    if (!user) return;
    
    try {
      const success = await toggleEventAttendance(event.id, user.id);
      
      if (success) {
        // Update local state to reflect the change
        const isAttending = !event.attendees.includes(user.id);
        const updatedEvent = {
          ...event,
          attendees: isAttending 
            ? [...event.attendees, user.id]
            : event.attendees.filter(id => id !== user.id)
        };
        
        // Update events list
        setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
        
        // Update selected event if needed
        if (selectedEvent && selectedEvent.id === event.id) {
          setSelectedEvent(updatedEvent);
        }
        
        // Show toast notification
        toast({
          title: isAttending ? "You're going!" : "RSVP cancelled",
          description: isAttending 
            ? `You've successfully RSVP'd to ${event.title}` 
            : `You've cancelled your RSVP to ${event.title}`,
        });
      } else {
        throw new Error("Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast({
        title: "Error",
        description: "Failed to update your RSVP. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateEvent = async (newEventData: Omit<Event, 'id' | 'attendees'>) => {
    if (!user) return;
    
    try {
      const newEvent = await createEvent({
        ...newEventData,
        organizerId: user.id,
      });
      
      if (newEvent) {
        // Add to events if we're on the MY_EVENTS tab
        if (activeTab === TabType.MY_EVENTS) {
          setEvents([newEvent, ...events]);
        }
        
        toast({
          title: "Event created!",
          description: `${newEvent.title} has been created successfully.`,
        });
        
        setIsCreateModalOpen(false);
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create your event. Please try again.",
        variant: "destructive"
      });
    }
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
  
  // Show loading spinner while authentication is checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
        {isLoadingEvents ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
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
            
            {activeTab === TabType.CALENDAR && (
              <EventList 
                events={events} 
                onEventClick={handleEventClick}
                onRsvp={handleRsvp}
                title="Events I'm Attending"
              />
            )}
            
            {activeTab === TabType.PROFILE && user && (
              <UserProfile 
                user={user}
                events={events}
                onCreateEvent={() => setIsCreateModalOpen(true)}
                onEventClick={handleEventClick}
                onRsvp={handleRsvp}
              />
            )}
          </>
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
