
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Profile } from '@/types/auth';

interface ParentSettingsLayoutProps {
  profile: Profile | null;
  children: React.ReactNode;
}

const ParentSettingsLayout = ({ profile, children }: ParentSettingsLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        currentView="settings" 
        profile={profile}
        onBack={() => navigate('/')}
        onChangeAgeGroup={() => {}} // Not applicable for parent users
      />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Parent Settings</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default ParentSettingsLayout;
