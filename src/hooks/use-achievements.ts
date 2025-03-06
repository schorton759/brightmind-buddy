
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/components/achievements/AchievementBadge';

export const useAchievements = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load achievements
  useEffect(() => {
    if (profile?.id) {
      loadAchievements();
    }
  }, [profile?.id]);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      
      // First, load the achievement definitions
      const defaultAchievements: Achievement[] = [
        {
          id: 'first-habit',
          type: 'milestone',
          title: 'Habit Starter',
          description: 'Created your first habit',
          icon: 'badge',
          unlocked: false
        },
        {
          id: 'habit-streak-3',
          type: 'streak',
          title: 'On a Roll',
          description: 'Maintained a 3-day streak for any habit',
          icon: 'award',
          unlocked: false
        },
        {
          id: 'habit-streak-7',
          type: 'streak',
          title: 'Week Warrior',
          description: 'Maintained a 7-day streak for any habit',
          icon: 'award',
          unlocked: false
        },
        {
          id: 'complete-3-tasks',
          type: 'completion',
          title: 'Task Master',
          description: 'Completed 3 tasks in one day',
          icon: 'target',
          unlocked: false,
          progress: 0,
          maxProgress: 3
        },
        {
          id: 'first-journal',
          type: 'milestone',
          title: 'Dear Diary',
          description: 'Wrote your first journal entry',
          icon: 'star',
          unlocked: false
        },
        {
          id: 'tutor-session',
          type: 'learning',
          title: 'Knowledge Seeker',
          description: 'Had your first conversation with a tutor',
          icon: 'trophy',
          unlocked: false
        }
      ];
      
      // Then check which ones the user has unlocked
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, progress')
        .eq('user_id', profile?.id);
        
      if (error) throw error;
      
      // Merge the data
      const mergedAchievements = defaultAchievements.map(achievement => {
        const userAchievement = userAchievements?.find(
          ua => ua.achievement_id === achievement.id
        );
        
        if (userAchievement) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: userAchievement.unlocked_at ? new Date(userAchievement.unlocked_at) : undefined,
            progress: userAchievement.progress || achievement.progress
          };
        }
        
        return achievement;
      });
      
      setAchievements(mergedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.unlocked) return;
    
    try {
      // Update locally first for immediate feedback
      setAchievements(prev => 
        prev.map(a => 
          a.id === achievementId 
            ? { ...a, unlocked: true, unlockedAt: new Date() }
            : a
        )
      );
      
      // Then update in the database
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: profile?.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Show a toast notification
      toast({
        title: "Achievement Unlocked!",
        description: achievement?.title,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      
      // Revert local change if there's an error
      setAchievements(prev => 
        prev.map(a => 
          a.id === achievementId && a.unlockedAt 
            ? { ...a, unlocked: false, unlockedAt: undefined }
            : a
        )
      );
    }
  };
  
  const updateAchievementProgress = async (achievementId: string, progress: number) => {
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) return;
    
    // Calculate if this should unlock the achievement
    const shouldUnlock = achievement.maxProgress && progress >= achievement.maxProgress;
    
    try {
      // Update locally first
      setAchievements(prev => 
        prev.map(a => 
          a.id === achievementId 
            ? { 
                ...a, 
                progress, 
                unlocked: shouldUnlock ? true : a.unlocked,
                unlockedAt: shouldUnlock && !a.unlocked ? new Date() : a.unlockedAt
              }
            : a
        )
      );
      
      // Then update in the database
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: profile?.id,
          achievement_id: achievementId,
          progress,
          unlocked_at: shouldUnlock ? new Date().toISOString() : undefined
        });
        
      if (error) throw error;
      
      // Show a toast notification if unlocked
      if (shouldUnlock && !achievement.unlocked) {
        toast({
          title: "Achievement Unlocked!",
          description: achievement?.title,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      
      // Revert local change if there's an error
      loadAchievements();
    }
  };

  return { 
    achievements, 
    isLoading,
    unlockAchievement,
    updateAchievementProgress,
    refreshAchievements: loadAchievements
  };
};
