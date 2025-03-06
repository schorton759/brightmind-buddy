
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';

export const useJournalAchievements = (hasEntry: boolean) => {
  const { achievements, unlockAchievement } = useAchievements();

  // Track journal-related achievements
  useEffect(() => {
    if (!hasEntry || !achievements.length) return;

    // Check for "First Journal" achievement
    const journalAchievement = achievements.find(a => a.id === 'first-journal');
    if (journalAchievement && !journalAchievement.unlocked) {
      unlockAchievement('first-journal');
    }
  }, [hasEntry, achievements]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
