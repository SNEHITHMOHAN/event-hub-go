
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventList from '@/components/EventList';
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

const Dashboard = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('myEvents');
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Load events based on active tab
  useEffect(() => {
    const loadEvents = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingEvents(true);
      try {
        let loadedEvents: Event[] = [];
        
        if (activeTab === 'explore') {
          loadedEvents = await fetchPublicEvents();
        } else if (activeTab === 'myEvents' && user) {
          loadedEvents = await fetchUserEvents(user.id);
        } else if (activeTab === 'attending' && user) {
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
    
    loadEvents();
  }, [activeTab, isAuthenticated, user, toast]);
  
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
        
        // Show toast notification
        toast({
          title: isAttending ? "You're going!" : "RSVP cancelled",
          description: isAttending 
            ? `You've successfully RSVP'd to ${event.title}` 
            : `You've cancelled your RSVP to ${event.title}`,
        });
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
        if (activeTab === 'myEvents') {
          setEvents([newEvent, ...events]);
        }
        
        toast({
          title: "Event created!",
          description: `${newEvent.title} has been created successfully.`,
        });
        
        setIsCreateModalOpen(false);
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
  
  // Show loading spinner while authentication is checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Eventify</h1>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </header>
      
      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="myEvents" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="attending" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Attending
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="myEvents" className="w-full">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <EventList 
                events={events} 
                onEventClick={(event) => window.location.href = `/`}
                onRsvp={handleRsvp}
                title="My Events"
                showSearch={false}
              />
            )}
          </TabsContent>
          
          <TabsContent value="attending" className="w-full">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <EventList 
                events={events} 
                onEventClick={(event) => window.location.href = `/`}
                onRsvp={handleRsvp}
                title="Events I'm Attending"
                showSearch={false}
              />
            )}
          </TabsContent>
          
          <TabsContent value="explore" className="w-full">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <EventList 
                events={events} 
                onEventClick={(event) => window.location.href = `/`}
                onRsvp={handleRsvp}
                title="Discover Events"
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-3 flex justify-around">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs"
          onClick={() => window.location.href = '/'}
        >
          <Calendar className="h-5 w-5 mb-1" />
          Events
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs"
          onClick={() => window.location.href = '/dashboard'}
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs"
          onClick={() => window.location.href = '/'}
        >
          <User className="h-5 w-5 mb-1" />
          Profile
        </Button>
      </div>
      
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default Dashboard;
