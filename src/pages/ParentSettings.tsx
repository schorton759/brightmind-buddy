
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ParentSettingsLayout from '@/components/parent/settings/ParentSettingsLayout';
import ParentSettingsTabs from '@/components/parent/settings/ParentSettingsTabs';
import { useToast } from '@/hooks/use-toast';

const ParentSettings = () => {
  const { profile, isLoading, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFixingProfile, setIsFixingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const metadataUserType = user?.user_metadata?.user_type;
      const profileUserType = profile?.user_type;
      
      console.log("Metadata user type:", metadataUserType);
      console.log("Profile user type:", profileUserType);
      
      // If user metadata says parent but profile says child, fix the profile
      if (metadataUserType === 'parent' && profileUserType === 'child' && !isFixingProfile) {
        setIsFixingProfile(true);
        
        // Update profile to match metadata
        updateProfile({ user_type: 'parent' })
          .then(() => {
            toast({
              title: "Profile updated",
              description: "Your account has been updated to parent status."
            });
            setIsFixingProfile(false);
          })
          .catch(error => {
            console.error("Failed to update profile:", error);
            toast({
              variant: "destructive",
              title: "Error updating profile",
              description: "Please try refreshing the page."
            });
            setIsFixingProfile(false);
          });
      }
      // If neither metadata nor profile indicates parent, redirect to home
      else if (metadataUserType !== 'parent' && profileUserType !== 'parent') {
        navigate('/');
      }
    }
  }, [isLoading, profile, user, navigate, updateProfile, toast, isFixingProfile]);

  if (isLoading || isFixingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">
          {isFixingProfile ? "Updating your profile..." : "Loading settings..."}
        </p>
      </div>
    );
  }

  return (
    <ParentSettingsLayout profile={profile}>
      <ParentSettingsTabs />
    </ParentSettingsLayout>
  );
};

export default ParentSettings;
