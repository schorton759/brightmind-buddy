
import { Achievement } from '@/components/achievements/AchievementBadge';

export const getDefaultAchievements = (): Achievement[] => [
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
