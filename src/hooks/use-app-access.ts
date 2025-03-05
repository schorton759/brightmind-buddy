
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface AppAccess {
  tutorsEnabled: boolean;
  habitTrackerEnabled: boolean;
  journalEnabled: boolean;
  tasksEnabled: boolean;
  isLoading: boolean;
}

export const useAppAccess = (childId?: string | null) => {
  const { profile } = useAuth();
  const [appAccess, setAppAccess] = useState<AppAccess>({
    tutorsEnabled: true,
    habitTrackerEnabled: true,
    journalEnabled: true,
    tasksEnabled: true,
    isLoading: true
  });

  useEffect(() => {
    const fetchAppAccess = async () => {
      try {
        const userId = childId || profile?.id;
        
        if (!userId) {
          return;
        }

        const { data, error } = await supabase
          .from('child_app_settings')
          .select('*')
          .eq('child_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching app access:', error);
          return;
        }

        if (data) {
          setAppAccess({
            tutorsEnabled: data.tutors_enabled ?? true,
            habitTrackerEnabled: data.habit_tracker_enabled ?? true,
            journalEnabled: data.journal_enabled ?? true,
            tasksEnabled: data.tasks_enabled ?? true,
            isLoading: false
          });
        } else {
          // Default all to enabled if no settings found
          setAppAccess({
            tutorsEnabled: true,
            habitTrackerEnabled: true,
            journalEnabled: true,
            tasksEnabled: true,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error in useAppAccess:', error);
      } finally {
        setAppAccess(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchAppAccess();
  }, [profile, childId]);

  return appAccess;
};
