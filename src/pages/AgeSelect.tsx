
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserAgeSelector from '@/components/UserAgeSelector';
import PageHeader from '@/components/PageHeader';

const AgeSelect = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleAgeSelection = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        currentView="age-select" 
        profile={profile}
      />
      
      <main className="max-w-md mx-auto py-8 px-4">
        <UserAgeSelector onComplete={handleAgeSelection} />
      </main>
    </div>
  );
};

export default AgeSelect;
