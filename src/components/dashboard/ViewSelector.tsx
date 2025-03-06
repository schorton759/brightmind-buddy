import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/Dashboard';
import HabitTracker from '@/components/HabitTracker';
import TaskManager from '@/components/TaskManager';
import JournalEntry from '@/components/JournalEntry';
import TutorsHub from '@/components/tutors/TutorsHub';
import ParentDashboard from '@/components/parent/ParentDashboard';
import AchievementsDashboard from '@/components/achievements/AchievementsDashboard';

interface ViewSelectorProps {
  currentView: string;
  profile: any;
  viewingChildId: string | null;
  viewingChildUsername: string | null;
  onNavigate: (page: string) => void;
  onViewChildDashboard: (childId: string, childUsername: string) => void;
}

const ViewSelector = ({
  currentView,
  profile,
  viewingChildId,
  viewingChildUsername,
  onNavigate,
  onViewChildDashboard
}: ViewSelectorProps) => {

  const handleNavigate = (page: string) => {
    onNavigate(page);
  };

  const renderView = () => {
    switch (currentView) {
      case 'child-dashboard':
        return <Dashboard ageGroup={profile?.age_group} username={profile?.username} onNavigate={handleNavigate} />;
      case 'habits':
        return <HabitTracker />;
      case 'tasks':
        return <TaskManager />;
      case 'journal':
        return <JournalEntry ageGroup={profile?.age_group} />;
      case 'achievements':
        return <AchievementsDashboard />;
      case 'tutors':
        return <TutorsHub />;
      case 'parent-dashboard':
        return <ParentDashboard onViewChildDashboard={onViewChildDashboard} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
};

export default ViewSelector;
