
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export const useProfile = (user: User | null, setIsLoading: (value: boolean) => void) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      console.log("Profile data:", data);
      if (data && data.length > 0) {
        setProfile(data[0] as Profile);
      } else {
        console.log("No profile found, creating default profile");
        const username = user?.user_metadata?.username || 'New User';
        const userType = (user?.user_metadata?.user_type as 'child' | 'parent') || 'child';
        const ageGroup = user?.user_metadata?.age_group as '8-10' | '10-12' | '13-15' | '15+' | null || null;
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            user_type: userType,
            age_group: ageGroup
          });
          
        if (insertError) {
          console.error('Error creating default profile:', insertError);
        } else {
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (fetchError) {
            console.error('Error fetching new profile:', fetchError);
          } else {
            setProfile(newProfile as Profile);
          }
        }
      }
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      setIsLoading(true);
      console.log("Updating profile with data:", data);
      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      console.log("Updated profile:", updatedProfile);
      setProfile(updatedProfile as Profile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return updatedProfile as Profile;
    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "Please try again later.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    setProfile,
    fetchUserProfile,
    updateProfile
  };
};
