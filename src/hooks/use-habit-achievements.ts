
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';
import { useNotifications } from '@/context/NotificationContext';
import { createHabitReminders } from '@/services/notification-service';

type Habit = {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
};

export const useHabitAchievements = (habits: Habit[]) => {
  const { achievements, unlockAchievement } = useAchievements();
  const { addNotification } = useNotifications();

  // Track habit-related achievements
  useEffect(() => {
    if (!habits.length || !achievements.length) return;

    // Check for "First Habit" achievement
    if (habits.length > 0) {
      const firstHabitAchievement = achievements.find(a => a.id === 'first-habit');
      if (firstHabitAchievement && !firstHabitAchievement.unlocked) {
        unlockAchievement('first-habit');
        
        // Add notification when achievement is unlocked
        addNotification(
          'achievement',
          'Achievement Unlocked!',
          'You earned the "Habit Starter" achievement by creating your first habit.',
          'first-habit',
          { label: 'View Achievements', href: '/achievements' }
        );
      }
    }

    // Check for streak achievements
    const highestStreak = Math.max(...habits.map(habit => habit.streak), 0);
    
    if (highestStreak >= 3) {
      const streakAchievement = achievements.find(a => a.id === 'habit-streak-3');
      if (streakAchievement && !streakAchievement.unlocked) {
        unlockAchievement('habit-streak-3');
        
        // Add notification when achievement is unlocked
        addNotification(
          'achievement',
          'Achievement Unlocked!',
          'You earned the "On a Roll" achievement by maintaining a 3-day streak.',
          'habit-streak-3',
          { label: 'View Achievements', href: '/achievements' }
        );
      }
    }
    
    if (highestStreak >= 7) {
      const streakAchievement = achievements.find(a => a.id === 'habit-streak-7');
      if (streakAchievement && !streakAchievement.unlocked) {
        unlockAchievement('habit-streak-7');
        
        // Add notification when achievement is unlocked
        addNotification(
          'achievement',
          'Achievement Unlocked!',
          'You earned the "Week Warrior" achievement by maintaining a 7-day streak.',
          'habit-streak-7',
          { label: 'View Achievements', href: '/achievements' }
        );
      }
    }
    
    // Create habit reminders once per day
    const lastReminderDate = localStorage.getItem('lastHabitReminderDate');
    const today = new Date().toDateString();
    
    if (lastReminderDate !== today) {
      createHabitReminders(habits);
      localStorage.setItem('lastHabitReminderDate', today);
    }
  }, [habits, achievements, unlockAchievement, addNotification]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
