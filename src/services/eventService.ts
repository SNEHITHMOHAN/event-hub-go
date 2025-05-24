import { supabase } from "@/integrations/supabase/client";
import { Event, SupabaseEvent, SupabaseAttendee, User } from "@/types";

// Fetch all public events
export const fetchPublicEvents = async (): Promise<Event[]> => {
  try {
    console.log('Fetching public events...');
    
    // Simplified query to avoid RLS recursion issues
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        date,
        time,
        location,
        image_url,
        organizer_id,
        capacity,
        tags,
        is_public,
        created_at
      `)
      .eq("is_public", true)
      .order("date", { ascending: true });
    
    if (error) {
      console.error("Error fetching events:", error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }

    if (!events || events.length === 0) {
      console.log('No events found');
      return [];
    }

    console.log('Events fetched successfully:', events.length);

    // Get organizers for these events
    const organizerIds = [...new Set(events.map(event => event.organizer_id))];
    const { data: organizers } = await supabase
      .from("profiles")
      .select("id, name, email, avatar")
      .in("id", organizerIds);
    
    // Get attendees for these events
    const eventIds = events.map(event => event.id);
    const { data: attendees } = await supabase
      .from("attendees")
      .select("event_id, user_id")
      .in("event_id", eventIds);
    
    // Map Supabase events to our app Event type
    return events.map(event => {
      // Find organizer for this event
      const organizer = organizers?.find(o => o.id === event.organizer_id);
      // Find attendees for this event
      const eventAttendees = attendees?.filter(a => a.event_id === event.id).map(a => a.user_id) || [];
      
      return mapSupabaseEventToEvent(event, eventAttendees, organizer);
    });
  } catch (error) {
    console.error("Error in fetchPublicEvents:", error);
    return [];
  }
};

// Fetch events organized by the current user
export const fetchUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    console.log('Fetching user events for:', userId);
    // Fetch events organized by the user
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", userId)
      .order("date", { ascending: true });
    
    if (error) {
      console.error("Error fetching user events:", error);
      return [];
    }

    if (!events || events.length === 0) {
      console.log('No user events found');
      return [];
    }

    // Get organizer details
    const { data: organizer } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    // Get attendees for these events
    const eventIds = events.map(event => event.id);
    const { data: attendees } = await supabase
      .from("attendees")
      .select("*")
      .in("event_id", eventIds);
    
    // Map Supabase events to our app Event type
    return events.map(event => {
      // Find attendees for this event
      const eventAttendees = attendees?.filter(a => a.event_id === event.id).map(a => a.user_id) || [];
      
      return mapSupabaseEventToEvent(event, eventAttendees, organizer);
    });
  } catch (error) {
    console.error("Error in fetchUserEvents:", error);
    return [];
  }
};

// Fetch events the user is attending but not organizing
export const fetchAttendingEvents = async (userId: string): Promise<Event[]> => {
  try {
    console.log('Fetching attending events for:', userId);
    // Find events the user is attending
    const { data: userAttendees, error: attendeesError } = await supabase
      .from("attendees")
      .select("event_id")
      .eq("user_id", userId);
    
    if (attendeesError || !userAttendees || userAttendees.length === 0) {
      console.log('No attending events found');
      return [];
    }

    const attendingEventIds = userAttendees.map(a => a.event_id);
    
    // Fetch the events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", attendingEventIds)
      .neq("organizer_id", userId) // Exclude events organized by the user
      .order("date", { ascending: true });
    
    if (eventsError || !events) {
      console.error("Error fetching attending events:", eventsError);
      return [];
    }

    // Get organizers for these events
    const organizerIds = [...new Set(events.map(event => event.organizer_id))];
    const { data: organizers } = await supabase
      .from("profiles")
      .select("id, name, email, avatar")
      .in("id", organizerIds);
    
    // Get all attendees for these events
    const { data: attendees } = await supabase
      .from("attendees")
      .select("event_id, user_id")
      .in("event_id", attendingEventIds);
    
    // Map Supabase events to our app Event type
    return events.map(event => {
      // Find organizer for this event
      const organizer = organizers?.find(o => o.id === event.organizer_id);
      // Find attendees for this event
      const eventAttendees = attendees?.filter(a => a.event_id === event.id).map(a => a.user_id) || [];
      
      return mapSupabaseEventToEvent(event, eventAttendees, organizer);
    });
  } catch (error) {
    console.error("Error in fetchAttendingEvents:", error);
    return [];
  }
};

// Toggle user attendance for an event
export const toggleEventAttendance = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    console.log('Toggling attendance for event:', eventId, 'user:', userId);
    // Check if user is already attending
    const { data: existing, error: checkError } = await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking attendance:", checkError);
      return false;
    }
    
    if (existing) {
      // Remove attendance
      const { error: deleteError } = await supabase
        .from("attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);
      
      if (deleteError) {
        console.error("Error canceling attendance:", deleteError);
        return false;
      }
      
      console.log('Successfully removed attendance');
      return true;
    } else {
      // Add attendance
      const { error: insertError } = await supabase
        .from("attendees")
        .insert({ event_id: eventId, user_id: userId });
      
      if (insertError) {
        console.error("Error adding attendance:", insertError);
        return false;
      }
      
      console.log('Successfully added attendance');
      return true;
    }
  } catch (error) {
    console.error("Error toggling attendance:", error);
    return false;
  }
};

// Create a new event
export const createEvent = async (eventData: Omit<Event, "id" | "attendees" | "organizer">): Promise<Event | null> => {
  try {
    console.log('Creating event with data:', eventData);
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location || !eventData.organizerId) {
      console.error('Missing required fields for event creation');
      throw new Error('All required fields must be filled');
    }

    // Get the organizer profile first to ensure it exists
    const { data: organizer, error: organizerError } = await supabase
      .from("profiles")
      .select("id, name, email, avatar")
      .eq("id", eventData.organizerId)
      .maybeSingle();
    
    if (organizerError) {
      console.error("Error fetching organizer profile:", organizerError);
      throw new Error('Failed to verify organizer profile');
    }

    if (!organizer) {
      console.error("Organizer profile not found");
      throw new Error('Organizer profile not found. Please try signing out and back in.');
    }

    // Map to Supabase format
    const supabaseEvent = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      image_url: eventData.imageUrl || null,
      organizer_id: eventData.organizerId,
      capacity: eventData.capacity,
      tags: eventData.tags,
      is_public: eventData.isPublic
    };
    
    console.log('Inserting event into database:', supabaseEvent);
    
    // Insert the event
    const { data, error } = await supabase
      .from("events")
      .insert(supabaseEvent)
      .select(`
        id,
        title,
        description,
        date,
        time,
        location,
        image_url,
        organizer_id,
        capacity,
        tags,
        is_public,
        created_at
      `)
      .single();
    
    if (error) {
      console.error("Error creating event:", error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from event creation");
      throw new Error('Event creation failed - no data returned');
    }
    
    console.log('Event created successfully:', data);
    
    // Return the created event
    return mapSupabaseEventToEvent(data, [], organizer);
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error; // Re-throw to allow proper error handling in the component
  }
};

// Get event by ID with full details
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    console.log('Fetching event by ID:', eventId);
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();
    
    if (error || !event) {
      console.error("Error fetching event:", error);
      return null;
    }

    // Get organizer details
    const { data: organizer } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", event.organizer_id)
      .maybeSingle();
    
    // Get attendees
    const { data: attendees } = await supabase
      .from("attendees")
      .select("user_id")
      .eq("event_id", eventId);

    const attendeeIds = attendees?.map(a => a.user_id) || [];
    
    return mapSupabaseEventToEvent(event, attendeeIds, organizer);
  } catch (error) {
    console.error("Error in getEventById:", error);
    return null;
  }
};

// Helper function to map Supabase event format to our app Event type
const mapSupabaseEventToEvent = (
  event: SupabaseEvent,
  attendeeIds: string[],
  organizer?: any
): Event => {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    imageUrl: event.image_url || undefined,
    organizerId: event.organizer_id,
    organizer: organizer ? {
      id: organizer.id,
      name: organizer.name,
      email: organizer.email,
      avatar: organizer.avatar || undefined
    } : undefined,
    attendees: attendeeIds,
    capacity: event.capacity,
    tags: event.tags,
    isPublic: event.is_public
  };
};
