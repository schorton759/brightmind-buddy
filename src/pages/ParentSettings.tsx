
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParentSettingsLayout from '@/components/parent/settings/ParentSettingsLayout';
import ParentSettingsTabs from '@/components/parent/settings/ParentSettingsTabs';

const ParentSettings = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile?.user_type !== 'parent') {
      navigate('/');
    }
  }, [isLoading, profile, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <ParentSettingsLayout profile={profile}>
      <ParentSettingsTabs />
    </ParentSettingsLayout>
  );
};

export default ParentSettings;
