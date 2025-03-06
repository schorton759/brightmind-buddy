
import { Achievement } from '@/components/achievements/AchievementBadge';

export interface AchievementData {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: 'badge' | 'award' | 'star' | 'trophy' | 'target';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: Date;
}

export interface UseAchievementsResult {
  achievements: Achievement[];
  isLoading: boolean;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateAchievementProgress: (achievementId: string, progress: number) => Promise<void>;
  refreshAchievements: () => Promise<void>;
}
