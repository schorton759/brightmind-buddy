
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';

type Habit = {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
};

export const useHabitAchievements = (habits: Habit[]) => {
  const { achievements, unlockAchievement } = useAchievements();

  // Track habit-related achievements
  useEffect(() => {
    if (!habits.length || !achievements.length) return;

    // Check for "First Habit" achievement
    if (habits.length > 0) {
      const firstHabitAchievement = achievements.find(a => a.id === 'first-habit');
      if (firstHabitAchievement && !firstHabitAchievement.unlocked) {
        unlockAchievement('first-habit');
      }
    }

    // Check for streak achievements
    const highestStreak = Math.max(...habits.map(habit => habit.streak), 0);
    
    if (highestStreak >= 3) {
      const streakAchievement = achievements.find(a => a.id === 'habit-streak-3');
      if (streakAchievement && !streakAchievement.unlocked) {
        unlockAchievement('habit-streak-3');
      }
    }
    
    if (highestStreak >= 7) {
      const streakAchievement = achievements.find(a => a.id === 'habit-streak-7');
      if (streakAchievement && !streakAchievement.unlocked) {
        unlockAchievement('habit-streak-7');
      }
    }
  }, [habits, achievements, unlockAchievement]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
