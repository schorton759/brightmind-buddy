
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge, Award, Star, Trophy, Target, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AchievementType = 'streak' | 'completion' | 'milestone' | 'learning' | 'consistency';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: 'badge' | 'award' | 'star' | 'trophy' | 'target';
  unlocked: boolean;
  progress?: number; // For achievements that have progress (0-100)
  maxProgress?: number;
  unlockedAt?: Date;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const AchievementBadge = ({ 
  achievement, 
  size = 'md',
  showTooltip = true,
  className 
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };

  const getIcon = () => {
    switch (achievement.icon) {
      case 'badge': return <Badge size={iconSize[size]} />;
      case 'award': return <Award size={iconSize[size]} />;
      case 'star': return <Star size={iconSize[size]} />;
      case 'trophy': return <Trophy size={iconSize[size]} />;
      case 'target': return <Target size={iconSize[size]} />;
      default: return <Award size={iconSize[size]} />;
    }
  };

  const badge = (
    <motion.div 
      className={cn(
        "relative rounded-full flex items-center justify-center",
        achievement.unlocked ? "bg-gradient-to-br from-amber-300 to-amber-500" : "bg-gray-300 dark:bg-gray-700",
        sizeClasses[size],
        className
      )}
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{ 
        scale: achievement.unlocked ? 1 : 0.9, 
        opacity: achievement.unlocked ? 1 : 0.5 
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: achievement.unlocked ? 1.1 : 0.95 }}
    >
      {achievement.progress !== undefined && achievement.maxProgress && (
        <svg viewBox="0 0 36 36" className="absolute w-full h-full">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="3"
            strokeDasharray="100, 100"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={achievement.unlocked ? "#FBBF24" : "#9CA3AF"}
            strokeWidth="3"
            strokeDasharray={`${(achievement.progress / achievement.maxProgress) * 100}, 100`}
          />
        </svg>
      )}
      <div className={cn(
        "text-white drop-shadow-md",
        achievement.unlocked ? "" : "opacity-50"
      )}>
        {getIcon()}
      </div>
      {achievement.unlocked && (
        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
          <Check size={size === 'sm' ? 10 : 14} className="text-white" />
        </div>
      )}
    </motion.div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{achievement.title}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-green-500">
                Unlocked on {achievement.unlockedAt.toLocaleDateString()}
              </p>
            )}
            {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
              <p className="text-xs">
                Progress: {achievement.progress}/{achievement.maxProgress}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
