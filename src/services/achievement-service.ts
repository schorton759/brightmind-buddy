
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/components/achievements/AchievementBadge';
import { getDefaultAchievements } from '@/data/default-achievements';

export const loadUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    // Load the achievement definitions
    const defaultAchievements = getDefaultAchievements();
    
    // Check which ones the user has unlocked
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at, progress')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Merge the data
    const mergedAchievements = defaultAchievements.map(achievement => {
      const userAchievement = userAchievements?.find(
        ua => ua.achievement_id === achievement.id
      );
      
      if (userAchievement) {
        return {
          ...achievement,
          unlocked: !!userAchievement.unlocked_at,
          unlockedAt: userAchievement.unlocked_at ? new Date(userAchievement.unlocked_at) : undefined,
          progress: userAchievement.progress || achievement.progress
        };
      }
      
      return achievement;
    });
    
    return mergedAchievements;
  } catch (error) {
    console.error('Error loading achievements:', error);
    return getDefaultAchievements();
  }
};

export const saveAchievementUnlock = async (userId: string, achievementId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString()
    });
    
  if (error) throw error;
};

export const saveAchievementProgress = async (
  userId: string, 
  achievementId: string, 
  progress: number,
  shouldUnlock: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      progress,
      unlocked_at: shouldUnlock ? new Date().toISOString() : null
    });
    
  if (error) throw error;
};
