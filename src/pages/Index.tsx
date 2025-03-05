
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
    console.log("Index page - User metadata:", user?.user_metadata);
    
    if (!authLoading) {
      if (!user) {
        // This shouldn't happen due to ProtectedRoute, but just in case
        navigate('/auth');
        return;
      }
      
      // First check if user is a parent based on metadata - this takes precedence
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'parent') {
        // If user metadata says this is a parent, go directly to parent dashboard
        console.log("User is a parent based on metadata - showing parent dashboard");
        setCurrentView('parent-dashboard');
        return;
      }
      
      // Then check profile if we have one
      if (profile) {
        console.log("Using profile data for routing, user_type:", profile.user_type);
        if (profile.user_type === 'parent') {
          setCurrentView('parent-dashboard');
        } else if (profile.user_type === 'child') {
          if (profile.age_group) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('age-select');
          }
        }
      } else if (userType === 'child') {
        // If no profile but metadata says it's a child
        console.log("User is a child based on metadata - showing age selection");
        setCurrentView('age-select');
      } else {
        // Fallback when we have no way to determine user type
        console.log("No profile or metadata user type - defaulting to age selection");
        setCurrentView('age-select');
      }
    }
  }, [profile, authLoading, user, navigate]);
  
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
