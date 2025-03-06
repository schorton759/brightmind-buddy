
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

export const useTaskAchievements = (tasks: Task[]) => {
  const { achievements, updateAchievementProgress } = useAchievements();

  // Track task-related achievements
  useEffect(() => {
    if (!tasks.length || !achievements.length) return;

    // Count completed tasks for today
    const completedTasks = tasks.filter(task => task.completed).length;
    
    // Update the "Complete 3 tasks" achievement
    const taskAchievement = achievements.find(a => a.id === 'complete-3-tasks');
    if (taskAchievement) {
      updateAchievementProgress('complete-3-tasks', completedTasks);
    }
  }, [tasks, achievements]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
