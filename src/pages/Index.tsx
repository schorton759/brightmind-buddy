
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgeGroupSelector from '@/components/AgeGroupSelector';
import Dashboard from '@/components/Dashboard';
import HabitTracker from '@/components/HabitTracker';
import JournalEntry from '@/components/JournalEntry';
import TaskManager from '@/components/TaskManager';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<string>('age-select');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [username, setUsername] = useState<string>('Buddy');
  
  const handleSelectAgeGroup = (group: string) => {
    setAgeGroup(group);
    setCurrentView('dashboard');
  };
  
  const handleNavigate = (page: string) => {
    setCurrentView(page);
  };
  
  const handleBack = () => {
    setCurrentView('dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentView !== 'age-select' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BrightMind Buddy
            </h1>
          </motion.div>
          {currentView !== 'age-select' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="outline" size="sm" onClick={() => setCurrentView('age-select')}>
                Change Age Group
              </Button>
            </motion.div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <AnimatePresence mode="wait">
          {currentView === 'age-select' && (
            <motion.div
              key="age-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Welcome to BrightMind Buddy
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Your personal AI life coach to help you build great habits, stay organized, and achieve your goals.
                </p>
              </motion.div>
              
              <div className="w-full">
                <AgeGroupSelector 
                  selectedGroup={ageGroup} 
                  onSelectGroup={handleSelectAgeGroup} 
                />
              </div>
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
                ageGroup={ageGroup} 
                username={username} 
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
              <JournalEntry ageGroup={ageGroup} />
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
      
      <footer className="border-t mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>BrightMind Buddy - Helping children build great habits</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
