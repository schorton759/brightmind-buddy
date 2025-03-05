import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgeGroupSelector from '@/components/AgeGroupSelector';
import Dashboard from '@/components/Dashboard';
import HabitTracker from '@/components/HabitTracker';
import JournalEntry from '@/components/JournalEntry';
import TaskManager from '@/components/TaskManager';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Define the age group type to match Supabase's type
type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

const Index = () => {
  const { profile, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<string>('loading');
  const [coachTip, setCoachTip] = useState<string>('');
  const [isUpdatingAgeGroup, setIsUpdatingAgeGroup] = useState(false);
  
  useEffect(() => {
    console.log("Index page - Profile state:", profile);
    console.log("Index page - Loading state:", authLoading);
    console.log("Index page - User state:", user);
    
    if (!authLoading) {
      if (profile) {
        if (profile.user_type === 'child' && profile.age_group) {
          setCurrentView('dashboard');
          fetchCoachTip(profile.age_group as AgeGroup);
        } else if (profile.user_type === 'child' && !profile.age_group) {
          setCurrentView('age-select');
        } else {
          // Parent view
          setCurrentView('dashboard');
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
  
  const fetchCoachTip = async (ageGroup: AgeGroup) => {
    try {
      const { data, error } = await supabase
        .from('coach_tips')
        .select('content')
        .eq('age_group', ageGroup)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching coach tip:', error);
        return;
      }

      if (data) {
        setCoachTip(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch coach tip:', error);
    }
  };
  
  const handleSelectAgeGroup = async (group: string) => {
    if (!user || isUpdatingAgeGroup) return;
    
    setIsUpdatingAgeGroup(true);
    
    try {
      console.log(`Updating age group to ${group} for user ID: ${user.id}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ age_group: group as AgeGroup })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating age group:', error);
        throw error;
      }
      
      toast({
        title: "Age group updated!",
        description: "Your profile has been updated successfully.",
      });
      
      // Reload the page to refresh the profile data
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update age group:', error);
      toast({
        variant: "destructive",
        title: "Failed to update age group",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsUpdatingAgeGroup(false);
    }
  };
  
  const handleNavigate = (page: string) => {
    setCurrentView(page);
  };
  
  const handleBack = () => {
    setCurrentView('dashboard');
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
              className="flex items-center space-x-4"
            >
              {profile?.user_type === 'child' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView('age-select')}
                >
                  Change Age Group
                </Button>
              )}
              <UserMenu />
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
                  selectedGroup={profile?.age_group || ''} 
                  onSelectGroup={handleSelectAgeGroup}
                  isLoading={isUpdatingAgeGroup}
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
      
      <footer className="border-t mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>BrightMind Buddy - Helping children build great habits</p>
          {coachTip && (
            <p className="mt-2 italic">"{coachTip}"</p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;
