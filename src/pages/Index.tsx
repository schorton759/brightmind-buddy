
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import HabitTracker from '@/components/HabitTracker';
import JournalEntry from '@/components/JournalEntry';
import TaskManager from '@/components/TaskManager';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCoachTip } from '@/hooks/use-coach-tip';
import UserAgeSelector from '@/components/UserAgeSelector';
import PageHeader from '@/components/PageHeader';
import PageFooter from '@/components/PageFooter';
import ParentDashboard from '@/components/parent/ParentDashboard';

// Define the age group type to match Supabase's type
type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

const Index = () => {
  const { profile, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<string>('loading');
  const { coachTip } = useCoachTip(profile?.age_group as AgeGroup);
  
  useEffect(() => {
    console.log("Index page - Profile state:", profile);
    console.log("Index page - Loading state:", authLoading);
    console.log("Index page - User state:", user);
    
    if (!authLoading) {
      if (profile) {
        // Show parent dashboard if user is a parent
        if (profile.user_type === 'parent') {
          setCurrentView('parent-dashboard');
        }
        // For children, show appropriate view
        else if (profile.user_type === 'child' && profile.age_group) {
          setCurrentView('dashboard');
        } else if (profile.user_type === 'child' && !profile.age_group) {
          setCurrentView('age-select');
        }
      } else {
        // If profile is null but user exists, we need to select age group
        if (user) {
          setCurrentView('age-select');
        } else {
          // This shouldn't happen due to ProtectedRoute, but just in case
          navigate('/auth');
        }
      }
    }
  }, [profile, authLoading, user]);
  
  const handleNavigate = (page: string) => {
    setCurrentView(page);
  };
  
  const handleBack = () => {
    // For parents, always go back to parent dashboard
    if (profile?.user_type === 'parent') {
      setCurrentView('parent-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  // Loading state
  if (currentView === 'loading' || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        currentView={currentView} 
        profile={profile} 
        onBack={handleBack} 
        onChangeAgeGroup={() => setCurrentView('age-select')}
      />
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <AnimatePresence mode="wait">
          {currentView === 'age-select' && (
            <UserAgeSelector onSelectComplete={() => setCurrentView('dashboard')} />
          )}
          
          {currentView === 'parent-dashboard' && (
            <motion.div
              key="parent-dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ParentDashboard />
            </motion.div>
          )}
          
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard 
                ageGroup={profile?.age_group || ''} 
                username={profile?.username || 'Buddy'} 
                onNavigate={handleNavigate} 
              />
            </motion.div>
          )}
          
          {currentView === 'habits' && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <HabitTracker />
            </motion.div>
          )}
          
          {currentView === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <JournalEntry ageGroup={profile?.age_group || ''} />
            </motion.div>
          )}
          
          {currentView === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TaskManager />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {currentView !== 'parent-dashboard' && (
        <PageFooter coachTip={coachTip} />
      )}
    </div>
  );
};

export default Index;
