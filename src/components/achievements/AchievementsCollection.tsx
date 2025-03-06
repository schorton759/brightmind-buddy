
import React from 'react';
import { motion } from 'framer-motion';
import AchievementBadge, { Achievement } from './AchievementBadge';
import { Badge } from '@/components/ui/badge';

interface AchievementsCollectionProps {
  achievements: Achievement[];
  title?: string;
  maxDisplay?: number;
  showUnlocked?: boolean;
  showLocked?: boolean;
}

const AchievementsCollection = ({
  achievements,
  title = "Achievements",
  maxDisplay,
  showUnlocked = true,
  showLocked = true
}: AchievementsCollectionProps) => {
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
  const lockedAchievements = achievements.filter(achievement => !achievement.unlocked);
  
  const displayAchievements = [
    ...(showUnlocked ? unlockedAchievements : []),
    ...(showLocked ? lockedAchievements : [])
  ].slice(0, maxDisplay);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        {unlockedAchievements.length > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {unlockedAchievements.length}/{achievements.length} Unlocked
          </Badge>
        )}
      </div>
      
      {displayAchievements.length > 0 ? (
        <motion.div 
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {displayAchievements.map((achievement) => (
            <motion.div key={achievement.id} variants={item}>
              <AchievementBadge 
                achievement={achievement} 
                size="md" 
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No achievements to display</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsCollection;
