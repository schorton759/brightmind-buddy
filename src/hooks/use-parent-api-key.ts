
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useParentApiKey() {
  const { profile } = useAuth();
  const [parentApiKey, setParentApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(0);

  const fetchParentApiKey = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setIsLoading(true);
      
      if (profile?.user_type === 'parent') {
        // For parent users, directly fetch their API key
        const { data: settings, error: settingsError } = await supabase
          .from('parent_settings')
          .select('openai_key')
          .eq('parent_id', profile.id)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching API key:', settingsError);
          return;
        }
        
        if (settings?.openai_key) {
          console.log('API key found for parent user');
          setParentApiKey(settings.openai_key);
        } else {
          console.log('No API key found for parent user');
          setParentApiKey(null);
        }
      } else if (profile?.user_type === 'child') {
        // For child users, find the parent first
        const { data: connections, error: connectionsError } = await supabase
          .from('family_connections')
          .select('parent_id')
          .eq('child_id', profile.id)
          .single();
          
        if (connectionsError) {
          console.error('Error fetching parent connection:', connectionsError);
          return;
        }
        
        if (!connections?.parent_id) {
          console.log('No parent found for child user');
          setParentApiKey(null);
          return;
        }
        
        // Then, fetch the parent's API key
        const { data: settings, error: settingsError } = await supabase
          .from('parent_settings')
          .select('openai_key')
          .eq('parent_id', connections.parent_id)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching parent API key:', settingsError);
          return;
        }
        
        if (settings?.openai_key) {
          console.log('API key found for child user (from parent)');
          setParentApiKey(settings.openai_key);
        } else {
          console.log('No API key found for child user (from parent)');
          setParentApiKey(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchParentApiKey:', error);
      setParentApiKey(null);
    } finally {
      setIsLoading(false);
      setLastRefreshed(Date.now());
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.id) {
      fetchParentApiKey();
    }
  }, [profile, fetchParentApiKey]);

  // Expose a refresh method that components can call
  const refreshApiKey = useCallback(() => {
    if (profile?.id) {
      fetchParentApiKey();
    }
  }, [profile, fetchParentApiKey]);

  return { 
    parentApiKey, 
    isLoading, 
    refreshApiKey,
    lastRefreshed
  };
}
