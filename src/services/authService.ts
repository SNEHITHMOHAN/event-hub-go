
import { supabase } from "@/integrations/supabase/client";
import { User, SupabaseProfile } from "@/types";

// Get the current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
};

// Get the current user with profile info
export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    return null;
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      // Return basic user info from auth if profile fetch fails
      return {
        id: session.user.id,
        name: session.user.user_metadata?.name || "User",
        email: session.user.email || "",
        avatar: session.user.user_metadata?.avatar_url
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || undefined
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Sign up a new user
export const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in signUp:", error);
    return { success: false, error: "An unexpected error occurred during sign up." };
  }
};

// Sign in a user
export const signIn = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in signIn:", error);
    return { success: false, error: "An unexpected error occurred during sign in." };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ success: boolean, error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in signOut:", error);
    return { success: false, error: "An unexpected error occurred during sign out." };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<User | null> => {
  try {
    // Convert to database format
    const supabaseProfileData: Partial<SupabaseProfile> = {
      name: profileData.name,
      email: profileData.email,
      avatar: profileData.avatar || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(supabaseProfileData)
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating profile:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || undefined
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return null;
  }
};
