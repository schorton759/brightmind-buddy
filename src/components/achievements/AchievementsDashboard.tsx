
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Star, Trophy, Target } from 'lucide-react';
import { useAchievements } from '@/hooks/use-achievements';
import AchievementsCollection from './AchievementsCollection';
import { Skeleton } from '@/components/ui/skeleton';
import { Achievement } from './AchievementBadge';

const AchievementsDashboard = () => {
  const { achievements, isLoading } = useAchievements();
  const [activeTab, setActiveTab] = useState('all');

  // Group achievements by type
  const filterAchievements = (type?: string): Achievement[] => {
    if (!type || type === 'all') return achievements;
    return achievements.filter(achievement => achievement.type === type);
  };

  // Calculate stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const unlockedPercentage = totalAchievements > 0 
    ? Math.round((unlockedAchievements / totalAchievements) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-16 w-16 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge className="h-5 w-5 mr-2 text-primary" />
              <span className="text-2xl font-bold">{totalAchievements}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-amber-500" />
              <span className="text-2xl font-bold">{unlockedAchievements}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{unlockedPercentage}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${unlockedPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="streak">Streaks</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <AchievementsCollection 
            achievements={filterAchievements('all')} 
            title="All Achievements"
          />
        </TabsContent>
        
        <TabsContent value="streak" className="mt-6">
          <AchievementsCollection 
            achievements={filterAchievements('streak')} 
            title="Streak Achievements"
          />
        </TabsContent>
        
        <TabsContent value="milestone" className="mt-6">
          <AchievementsCollection 
            achievements={filterAchievements('milestone')} 
            title="Milestone Achievements"
          />
        </TabsContent>
        
        <TabsContent value="completion" className="mt-6">
          <AchievementsCollection 
            achievements={filterAchievements('completion')} 
            title="Completion Achievements"
          />
        </TabsContent>
        
        <TabsContent value="learning" className="mt-6">
          <AchievementsCollection 
            achievements={filterAchievements('learning')} 
            title="Learning Achievements"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsDashboard;
