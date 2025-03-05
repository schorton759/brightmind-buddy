
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import HabitTracker from '@/components/HabitTracker';
import JournalEntry from '@/components/JournalEntry';
import TaskManager from '@/components/TaskManager';
import TutorsHub from '@/components/tutors/TutorsHub';
import MathTutor from '@/components/tutors/MathTutor';
import LanguageTutor from '@/components/tutors/LanguageTutor';
import ParentDashboard from '@/components/parent/ParentDashboard';
import UserAgeSelector from '@/components/UserAgeSelector';
import { Profile } from '@/types/auth';

type ViewSelectorProps = {
  currentView: string;
  profile: Profile | null;
  viewingChildId: string | null;
  viewingChildUsername: string;
  onNavigate: (page: string) => void;
  onViewChildDashboard: (childId: string, username: string) => void;
};

const ViewSelector = ({
  currentView,
  profile,
  viewingChildId,
  viewingChildUsername,
  onNavigate,
  onViewChildDashboard
}: ViewSelectorProps) => {
  return (
    <AnimatePresence mode="wait">
      {currentView === 'age-select' && (
        <UserAgeSelector onSelectComplete={() => onNavigate('dashboard')} />
      )}
      
      {currentView === 'parent-dashboard' && (
        <motion.div
          key="parent-dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <ParentDashboard onViewChildDashboard={onViewChildDashboard} />
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
                onNavigate={onNavigate} 
              />
            </>
          ) : (
            <Dashboard 
              ageGroup={profile?.age_group || ''} 
              username={profile?.username || 'Buddy'} 
              onNavigate={onNavigate} 
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
  );
};

export default ViewSelector;
