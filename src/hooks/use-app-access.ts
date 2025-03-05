
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

interface AppAccess {
  tutors: boolean;
  habitTracker: boolean;
  journalEntries: boolean;
  taskManager: boolean;
}

export const useAppAccess = () => {
  const [access, setAccess] = useState<AppAccess>({
    tutors: true,
    habitTracker: true,
    journalEntries: true,
    taskManager: true
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.user_type === 'child') {
      fetchAppAccess();
    } else {
      // Parents have access to everything
      setLoading(false);
    }
  }, [user, profile]);

  const fetchAppAccess = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('child_app_settings')
        .select('*')
        .eq('child_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned' error
        throw error;
      }
      
      if (data) {
        setAccess({
          tutors: data.tutors_enabled,
          habitTracker: data.habit_tracker_enabled,
          journalEntries: data.journal_enabled,
          taskManager: data.tasks_enabled
        });
      }
    } catch (error) {
      console.error('Error fetching app access:', error);
      toast({
        variant: "destructive",
        title: "Error loading app access settings",
        description: "Using default access settings."
      });
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (app: keyof AppAccess): boolean => {
    // If it's loading or profile is not a child, assume access is granted
    if (loading || profile?.user_type !== 'child') {
      return true;
    }
    
    return access[app];
  };

  return {
    access,
    loading,
    hasAccess
  };
};
