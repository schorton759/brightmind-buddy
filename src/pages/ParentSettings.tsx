
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { ArrowLeft } from 'lucide-react';
import AppAccessControls from '@/components/parent/settings/AppAccessControls';
import ApiSettings from '@/components/parent/settings/ApiSettings';

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
        
        <Tabs defaultValue="app-access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app-access">App Access Controls</TabsTrigger>
            <TabsTrigger value="api-settings">API Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app-access" className="mt-6">
            <AppAccessControls />
          </TabsContent>
          
          <TabsContent value="api-settings" className="mt-6">
            <ApiSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParentSettings;
