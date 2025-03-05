
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCoachTip } from '@/hooks/use-coach-tip';
import { useViewNavigation } from '@/hooks/use-view-navigation';
import PageHeader from '@/components/PageHeader';
import PageFooter from '@/components/PageFooter';
import ViewSelector from '@/components/dashboard/ViewSelector';

type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

const Index = () => {
  const { profile, isLoading: authLoading, user } = useAuth();
  const { coachTip } = useCoachTip(profile?.age_group as AgeGroup);
  
  const {
    currentView,
    viewingChildId,
    viewingChildUsername,
    initializeView,
    handleNavigate,
    handleBack,
    handleViewChildDashboard
  } = useViewNavigation();
  
  useEffect(() => {
    console.log("Index page - Profile state:", profile);
    console.log("Index page - Loading state:", authLoading);
    console.log("Index page - User state:", user);
    console.log("Index page - User metadata:", user?.user_metadata);
    
    initializeView(authLoading);
  }, [profile, authLoading, user]);
  
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
        onChangeAgeGroup={() => handleNavigate('age-select')}
      />
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <ViewSelector
          currentView={currentView}
          profile={profile}
          viewingChildId={viewingChildId}
          viewingChildUsername={viewingChildUsername}
          onNavigate={handleNavigate}
          onViewChildDashboard={handleViewChildDashboard}
        />
      </main>
      
      {currentView !== 'parent-dashboard' && (
        <PageFooter coachTip={coachTip} />
      )}
    </div>
  );
};

export default Index;
