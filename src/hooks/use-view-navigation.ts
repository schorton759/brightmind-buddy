
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useViewNavigation = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<string>('loading');
  const [viewingChildId, setViewingChildId] = useState<string | null>(null);
  const [viewingChildUsername, setViewingChildUsername] = useState<string>('');
  
  const initializeView = (isLoading: boolean) => {
    if (!isLoading) {
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
            setCurrentView('child-dashboard');
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
  };
  
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
      setCurrentView('child-dashboard');
    }
  };

  const handleViewChildDashboard = (childId: string, username: string) => {
    setViewingChildId(childId);
    setViewingChildUsername(username);
    setCurrentView('view-child');  // Changed from 'dashboard' to 'view-child'
  };

  return {
    currentView,
    viewingChildId,
    viewingChildUsername,
    initializeView,
    handleNavigate,
    handleBack,
    handleViewChildDashboard
  };
};
