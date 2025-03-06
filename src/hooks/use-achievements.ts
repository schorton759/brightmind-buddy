
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Achievement } from '@/components/achievements/AchievementBadge';
import { UseAchievementsResult } from '@/types/achievements';
import { 
  loadUserAchievements, 
  saveAchievementUnlock, 
  saveAchievementProgress 
} from '@/services/achievement-service';

export const useAchievements = (): UseAchievementsResult => {
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
      if (!profile?.id) return;
      
      const loadedAchievements = await loadUserAchievements(profile.id);
      setAchievements(loadedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.unlocked || !profile?.id) return;
    
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
      await saveAchievementUnlock(profile.id, achievementId);
      
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
    
    if (!achievement || !profile?.id) return;
    
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
      await saveAchievementProgress(profile.id, achievementId, progress, shouldUnlock);
      
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
