import { supabase } from "@/integrations/supabase/client";
import { Event, SupabaseEvent, SupabaseAttendee, User } from "@/types";

// Convert Supabase event format to our app's Event format
export const mapSupabaseEvent = (event: SupabaseEvent, attendeeIds: string[] = []): Event => {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    imageUrl: event.image_url || undefined,
    organizerId: event.organizer_id,
    attendees: attendeeIds,
    capacity: event.capacity,
    tags: event.tags,
    isPublic: event.is_public
  };
};

// Fetch all public events
export const fetchPublicEvents = async (): Promise<Event[]> => {
  try {
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("is_public", true);

    if (eventsError) {
      console.error("Error fetching public events:", eventsError);
      return [];
    }

    // For each event, fetch its attendees
    const eventsWithAttendees = await Promise.all(
      eventsData.map(async (event) => {
        const { data: attendees, error: attendeesError } = await supabase
          .from("attendees")
          .select("user_id")
          .eq("event_id", event.id);

        if (attendeesError) {
          console.error(`Error fetching attendees for event ${event.id}:`, attendeesError);
          return mapSupabaseEvent(event);
        }

        const attendeeIds = attendees.map((attendee) => attendee.user_id);
        return mapSupabaseEvent(event, attendeeIds);
      })
    );

    return eventsWithAttendees;
  } catch (error) {
    console.error("Error in fetchPublicEvents:", error);
    return [];
  }
};

// Fetch events for a specific user (both organized and attending)
export const fetchUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    // Fetch events organized by the user
    const { data: organizedEvents, error: organizedError } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", userId);

    if (organizedError) {
      console.error("Error fetching organized events:", organizedError);
      return [];
    }

    // Fetch events the user is attending
    const { data: attendingData, error: attendingError } = await supabase
      .from("attendees")
      .select("event_id")
      .eq("user_id", userId);

    if (attendingError) {
      console.error("Error fetching attending events:", attendingError);
      return organizedEvents.map(event => mapSupabaseEvent(event));
    }

    // If the user is attending any events, fetch those event details
    let attendingEvents: SupabaseEvent[] = [];
    if (attendingData.length > 0) {
      const eventIds = attendingData.map(item => item.event_id);
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (!eventsError && eventsData) {
        attendingEvents = eventsData;
      }
    }

    // Combine both lists and remove duplicates
    const allEventIds = new Set();
    const combinedEvents: Event[] = [];

    // Process organized events
    for (const event of organizedEvents) {
      if (!allEventIds.has(event.id)) {
        allEventIds.add(event.id);
        // Fetch attendees for this event
        const { data: attendees } = await supabase
          .from("attendees")
          .select("user_id")
          .eq("event_id", event.id);

        const attendeeIds = attendees?.map(a => a.user_id) || [];
        combinedEvents.push(mapSupabaseEvent(event, attendeeIds));
      }
    }

    // Process attending events
    for (const event of attendingEvents) {
      if (!allEventIds.has(event.id)) {
        allEventIds.add(event.id);
        // Fetch attendees for this event
        const { data: attendees } = await supabase
          .from("attendees")
          .select("user_id")
          .eq("event_id", event.id);

        const attendeeIds = attendees?.map(a => a.user_id) || [];
        combinedEvents.push(mapSupabaseEvent(event, attendeeIds));
      }
    }

    return combinedEvents;
  } catch (error) {
    console.error("Error in fetchUserEvents:", error);
    return [];
  }
};

// Toggle attendance for an event
export const toggleAttendance = async (eventId: string, userId: string): Promise<Event | null> => {
  try {
    // Check if the user is already attending
    const { data: existingAttendee, error: checkError } = await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking attendance:", checkError);
      return null;
    }

    // If the user is already attending, remove them
    if (existingAttendee) {
      const { error: deleteError } = await supabase
        .from("attendees")
        .delete()
        .eq("id", existingAttendee.id);

      if (deleteError) {
        console.error("Error removing attendance:", deleteError);
        return null;
      }
    } else {
      // Otherwise, add them as an attendee
      const { error: insertError } = await supabase
        .from("attendees")
        .insert({ event_id: eventId, user_id: userId });

      if (insertError) {
        console.error("Error adding attendance:", insertError);
        return null;
      }
    }

    // Get the updated event with current attendees
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !eventData) {
      console.error("Error fetching updated event:", eventError);
      return null;
    }

    // Get updated attendees
    const { data: attendees, error: attendeesError } = await supabase
      .from("attendees")
      .select("user_id")
      .eq("event_id", eventId);

    if (attendeesError) {
      console.error("Error fetching updated attendees:", attendeesError);
      return mapSupabaseEvent(eventData);
    }

    const attendeeIds = attendees.map(attendee => attendee.user_id);
    return mapSupabaseEvent(eventData, attendeeIds);
  } catch (error) {
    console.error("Error in toggleAttendance:", error);
    return null;
  }
};

// Create a new event
export const createEvent = async (eventData: Omit<Event, 'id' | 'attendees'>): Promise<Event | null> => {
  try {
    // Convert to Supabase format
    const supabaseEventData = {
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

    const { data, error } = await supabase
      .from("events")
      .insert(supabaseEventData)
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating event:", error);
      return null;
    }

    return mapSupabaseEvent(data, []);
  } catch (error) {
    console.error("Error in createEvent:", error);
    return null;
  }
};
