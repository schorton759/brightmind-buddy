
import { useEffect } from 'react';
import { useAchievements } from './use-achievements';
import { Message } from '@/components/tutors/TutorChatMessage';

export const useTutorAchievements = (messages: Message[]) => {
  const { achievements, unlockAchievement } = useAchievements();

  // Track tutor-related achievements
  useEffect(() => {
    if (!messages.length || !achievements.length) return;

    // Check if there's any conversation with the tutor
    const hasConversation = messages.length >= 2; // At least one user message and one assistant message
    
    if (hasConversation) {
      const tutorAchievement = achievements.find(a => a.id === 'tutor-session');
      if (tutorAchievement && !tutorAchievement.unlocked) {
        unlockAchievement('tutor-session');
      }
    }
  }, [messages, achievements]);

  return null; // This hook doesn't need to return anything as it works via side effects
};
