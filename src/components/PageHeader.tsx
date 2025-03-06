
import React from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { Button } from './ui/button';
import UserMenu from './UserMenu';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types/auth';
import NotificationIcon from './notifications/NotificationIcon';

interface PageHeaderProps {
  currentView: string;
  profile: Profile | null;
  onBack?: () => void;
  onChangeAgeGroup?: () => void;
}

const PageHeader = ({ currentView, profile, onBack, onChangeAgeGroup }: PageHeaderProps) => {
  const { user } = useAuth();
  
  // Don't render anything if the user isn't authenticated
  if (!user) return null;
  
  // For child views, show the back button and page title
  if (currentView === 'loading') {
    return <div className="h-16"></div>;
  }
  
  // Show a header based on the current view
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
          {onBack ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack} 
              className="mr-2"
            >
              <ArrowLeftCircle className="h-5 w-5" />
            </Button>
          ) : null}
          
          <div>
            {currentView === 'parent-dashboard' && (
              <h2 className="text-lg font-medium">Parent Dashboard</h2>
            )}
            
            {currentView === 'child-dashboard' && (
              <h2 className="text-lg font-medium">My Dashboard</h2>
            )}
            
            {currentView === 'age-select' && (
              <h2 className="text-lg font-medium">Select Age Group</h2>
            )}
            
            {currentView === 'view-child' && (
              <h2 className="text-lg font-medium">Child Dashboard</h2>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationIcon />
          <UserMenu 
            profile={profile} 
            onChangeAgeGroup={onChangeAgeGroup} 
          />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
