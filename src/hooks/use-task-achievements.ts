
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';
import { useNotifications } from '@/context/NotificationContext';
import { createTaskReminders } from '@/services/notification-service';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

export const useTaskAchievements = (tasks: Task[]) => {
  const { achievements, updateAchievementProgress } = useAchievements();
  const { addNotification } = useNotifications();

  // Track task-related achievements
  useEffect(() => {
    if (!tasks.length || !achievements.length) return;

    // Count completed tasks for today
    const completedTasks = tasks.filter(task => task.completed).length;
    
    // Update the "Complete 3 tasks" achievement
    const taskAchievement = achievements.find(a => a.id === 'complete-3-tasks');
    if (taskAchievement) {
      // If achievement was just completed, show a notification
      const wasCompleted = taskAchievement.progress >= (taskAchievement.maxProgress || 3);
      
      updateAchievementProgress('complete-3-tasks', completedTasks);
      
      // Check if achievement is now completed but wasn't before
      const isNowCompleted = completedTasks >= (taskAchievement.maxProgress || 3);
      
      if (isNowCompleted && !wasCompleted) {
        addNotification(
          'achievement',
          'Achievement Unlocked!',
          'You earned the "Task Master" achievement by completing 3 tasks.',
          'complete-3-tasks',
          { label: 'View Achievements', href: '/achievements' }
        );
      }
    }
    
    // Create task reminders once per day
    const lastReminderDate = localStorage.getItem('lastTaskReminderDate');
    const today = new Date().toDateString();
    
    if (lastReminderDate !== today) {
      createTaskReminders(tasks);
      localStorage.setItem('lastTaskReminderDate', today);
    }
  }, [tasks, achievements, updateAchievementProgress, addNotification]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
