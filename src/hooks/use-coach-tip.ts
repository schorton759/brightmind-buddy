
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the age group type to match Supabase's type
type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

export const useCoachTip = (ageGroup: AgeGroup | null) => {
  const [coachTip, setCoachTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const fetchCoachTip = async (ageGroup: AgeGroup) => {
    if (!ageGroup) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coach_tips')
        .select('content')
        .eq('age_group', ageGroup)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching coach tip:', error);
        return;
      }

      if (data) {
        setCoachTip(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch coach tip:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (ageGroup) {
      fetchCoachTip(ageGroup);
    }
  }, [ageGroup]);
  
  return { coachTip, isLoading, fetchCoachTip };
};
