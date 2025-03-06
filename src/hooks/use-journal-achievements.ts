
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
};

export const useJournalAchievements = (journalEntries: JournalEntry[]) => {
  const { achievements, unlockAchievement } = useAchievements();

  // Track journal-related achievements
  useEffect(() => {
    if (!journalEntries.length || !achievements.length) return;

    // Check for "First Journal Entry" achievement
    if (journalEntries.length > 0) {
      const firstJournalAchievement = achievements.find(a => a.id === 'first-journal');
      if (firstJournalAchievement && !firstJournalAchievement.unlocked) {
        unlockAchievement('first-journal');
      }
    }
  }, [journalEntries, achievements, unlockAchievement]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
