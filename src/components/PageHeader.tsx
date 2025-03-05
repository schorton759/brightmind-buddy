
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { UserMenu } from '@/components/UserMenu';
import { Profile } from '@/types/auth';

type PageHeaderProps = {
  currentView: string;
  profile: Profile | null;
  onBack: () => void;
  onChangeAgeGroup: () => void;
};

const PageHeader = ({ currentView, profile, onBack, onChangeAgeGroup }: PageHeaderProps) => {
  // Determine if back button should be shown
  const showBackButton = currentView !== 'parent-dashboard' && currentView !== 'age-select';
  
  // Only show age group change button for child accounts on dashboard
  const showAgeGroupButton = profile?.user_type === 'child' && 
                            currentView !== 'age-select' && 
                            currentView === 'dashboard';
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            BrightMind Buddy
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-4"
        >
          {showAgeGroupButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onChangeAgeGroup}
            >
              Change Age Group
            </Button>
          )}
          <UserMenu />
        </motion.div>
      </div>
    </header>
  );
};

export default PageHeader;
