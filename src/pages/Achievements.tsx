
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import PageFooter from '@/components/PageFooter';
import { useCoachTip } from '@/hooks/use-coach-tip';
import AchievementsDashboard from '@/components/achievements/AchievementsDashboard';

const Achievements = () => {
  const { profile } = useAuth();
  const { coachTip } = useCoachTip(profile?.age_group as any);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        currentView="child-dashboard" 
        profile={profile} 
        onBack={() => window.history.back()} 
        onChangeAgeGroup={() => {}} // Adding the missing prop
      />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Achievements</h1>
        <AchievementsDashboard />
      </main>
      
      <PageFooter coachTip={coachTip} />
    </div>
  );
};

export default Achievements;
