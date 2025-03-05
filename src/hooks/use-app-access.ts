
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAppAccess = () => {
  const { profile } = useAuth();
  const [appAccess, setAppAccess] = useState({
    tutors: true,
    habitTracker: true,
    journalEntries: true,
    taskManager: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (profile?.id && profile.user_type === 'child') {
      fetchAppAccess();
    } else {
      // If not a child, assume all apps are accessible
      setIsLoading(false);
    }
  }, [profile]);

  const fetchAppAccess = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('child_app_settings')
        .select('*')
        .eq('child_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAppAccess({
          tutors: data.tutors_enabled,
          habitTracker: data.habit_tracker_enabled,
          journalEntries: data.journal_enabled,
          taskManager: data.tasks_enabled
        });
      }
    } catch (err) {
      console.error('Error fetching app access settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch app access'));
    } finally {
      setIsLoading(false);
    }
  };

  const hasAccess = (app: keyof typeof appAccess): boolean => {
    // Parents always have access to all apps
    if (profile?.user_type === 'parent') return true;
    
    // For children, check specific app access
    return appAccess[app];
  };

  return {
    hasAccess,
    isLoading,
    error,
    appAccess
  };
};
