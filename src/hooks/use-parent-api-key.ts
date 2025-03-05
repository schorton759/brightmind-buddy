
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useParentApiKey() {
  const { profile } = useAuth();
  const [parentApiKey, setParentApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch parent API key for child users
    if (profile?.user_type === 'child') {
      fetchParentApiKey();
    }
  }, [profile]);

  const fetchParentApiKey = async () => {
    try {
      setIsLoading(true);
      
      // First, find the parent of this child
      const { data: connections, error: connectionsError } = await supabase
        .from('family_connections')
        .select('parent_id')
        .eq('child_id', profile?.id)
        .single();
        
      if (connectionsError) {
        console.error('Error fetching parent connection:', connectionsError);
        return;
      }
      
      if (!connections?.parent_id) return;
      
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
        setParentApiKey(settings.openai_key);
      }
    } catch (error) {
      console.error('Error in fetchParentApiKey:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { parentApiKey, isLoading };
}
