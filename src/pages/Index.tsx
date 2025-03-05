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
import TutorsHub from '@/components/tutors/TutorsHub';
import MathTutor from '@/components/tutors/MathTutor';
import LanguageTutor from '@/components/tutors/LanguageTutor';

type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

const Index = () => {
  const { profile, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<string>('loading');
  const [viewingChildId, setViewingChildId] = useState<string | null>(null);
  const [viewingChildUsername, setViewingChildUsername] = useState<string>('');
  const { coachTip } = useCoachTip(profile?.age_group as AgeGroup);
  
  useEffect(() => {
    console.log("Index page - Profile state:", profile);
    console.log("Index page - Loading state:", authLoading);
    console.log("Index page - User state:", user);
    console.log("Index page - User metadata:", user?.user_metadata);
    
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      const userType = user.user_metadata?.user_type;
      
      if (userType === 'parent') {
        setCurrentView('parent-dashboard');
        return;
      }
      
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
        console.log("User is a child based on metadata - showing age selection");
        setCurrentView('age-select');
      } else {
        console.log("No profile or metadata user type - defaulting to age selection");
        setCurrentView('age-select');
      }
    }
  }, [profile, authLoading, user, navigate]);
  
  const handleNavigate = (page: string) => {
    setCurrentView(page);
  };
  
  const handleBack = () => {
    if (viewingChildId) {
      setViewingChildId(null);
      setViewingChildUsername('');
      setCurrentView('parent-dashboard');
    } else if (profile?.user_type === 'parent' || user?.user_metadata?.user_type === 'parent') {
      setCurrentView('parent-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleViewChildDashboard = (childId: string, username: string) => {
    setViewingChildId(childId);
    setViewingChildUsername(username);
    setCurrentView('dashboard');
  };

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
              <ParentDashboard onViewChildDashboard={handleViewChildDashboard} />
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
              {viewingChildId ? (
                <>
                  <div className="mb-4 bg-secondary/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You are viewing <span className="font-semibold">{viewingChildUsername}</span>'s dashboard as a parent
                    </p>
                  </div>
                  <Dashboard 
                    ageGroup={profile?.age_group || ''} 
                    username={viewingChildUsername} 
                    onNavigate={handleNavigate} 
                  />
                </>
              ) : (
                <Dashboard 
                  ageGroup={profile?.age_group || ''} 
                  username={profile?.username || 'Buddy'} 
                  onNavigate={handleNavigate} 
                />
              )}
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
          
          {currentView === 'tutors' && (
            <motion.div
              key="tutors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TutorsHub />
            </motion.div>
          )}
          
          {currentView === 'math-tutor' && (
            <motion.div
              key="math-tutor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <MathTutor />
            </motion.div>
          )}
          
          {currentView === 'language-tutor' && (
            <motion.div
              key="language-tutor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LanguageTutor />
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
