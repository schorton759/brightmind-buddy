
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';
import { ArrowLeft } from 'lucide-react';

interface ChildAppAccess {
  id: string;
  username: string;
  apps: {
    tutors: boolean;
    habitTracker: boolean;
    journalEntries: boolean;
    taskManager: boolean;
  };
}

const ParentSettings = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [childProfiles, setChildProfiles] = useState<ChildAppAccess[]>([]);
  const [openAIKey, setOpenAIKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    if (!isLoading && profile?.user_type !== 'parent') {
      navigate('/');
    }
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    if (profile?.user_type === 'parent') {
      fetchChildProfiles();
      fetchOpenAIKey();
    }
  }, [profile]);

  const fetchChildProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      
      // First get all children connected to this parent
      const { data: connections, error: connectionsError } = await supabase
        .from('family_connections')
        .select('child_id')
        .eq('parent_id', profile?.id);

      if (connectionsError) throw connectionsError;
      
      if (connections && connections.length > 0) {
        // Get all child profiles
        const childIds = connections.map(conn => conn.child_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', childIds);
          
        if (profilesError) throw profilesError;

        // Get app access settings for each child
        const { data: appSettings, error: appSettingsError } = await supabase
          .from('child_app_settings')
          .select('*')
          .in('child_id', childIds);
          
        if (appSettingsError) throw appSettingsError;
        
        // Combine profiles with their settings
        const childrenWithAccess = profiles?.map(child => {
          const settings = appSettings?.find(setting => setting.child_id === child.id);
          
          return {
            id: child.id,
            username: child.username,
            apps: {
              tutors: settings?.tutors_enabled ?? true,
              habitTracker: settings?.habit_tracker_enabled ?? true,
              journalEntries: settings?.journal_enabled ?? true,
              taskManager: settings?.tasks_enabled ?? true
            }
          };
        });
        
        setChildProfiles(childrenWithAccess || []);
      } else {
        setChildProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching child profiles:', error);
      toast({
        variant: "destructive",
        title: "Failed to load child profiles",
        description: "Please try again later."
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const fetchOpenAIKey = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_settings')
        .select('openai_key')
        .eq('parent_id', profile?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setOpenAIKey(data.openai_key || '');
      }
    } catch (error) {
      console.error('Error fetching OpenAI key:', error);
    }
  };

  const handleSaveAPIKey = async () => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('parent_settings')
        .upsert({ 
          parent_id: profile?.id,
          openai_key: openAIKey
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        variant: "destructive",
        title: "Failed to save API key",
        description: "Please try again later."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAppAccessToggle = async (childId: string, appName: keyof ChildAppAccess['apps'], value: boolean) => {
    try {
      // Update the UI immediately for better user experience
      setChildProfiles(prev => 
        prev.map(child => {
          if (child.id === childId) {
            return {
              ...child,
              apps: {
                ...child.apps,
                [appName]: value
              }
            };
          }
          return child;
        })
      );
      
      // Map UI app names to database column names
      const columnMapping: Record<string, string> = {
        tutors: 'tutors_enabled',
        habitTracker: 'habit_tracker_enabled',
        journalEntries: 'journal_enabled',
        taskManager: 'tasks_enabled'
      };
      
      // Update in database
      const { error } = await supabase
        .from('child_app_settings')
        .upsert({ 
          child_id: childId,
          [columnMapping[appName]]: value
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error(`Error updating ${appName} access:`, error);
      toast({
        variant: "destructive",
        title: "Failed to update app access",
        description: "Please try again later."
      });
      
      // Revert UI if there was an error
      fetchChildProfiles();
    }
  };

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
            <Card>
              <CardHeader>
                <CardTitle>Children's App Access</CardTitle>
                <CardDescription>Control which apps your children can access</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfiles ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : childProfiles.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No child profiles found. Add a child from the dashboard first.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {childProfiles.map(child => (
                      <div key={child.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-4">{child.username}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`tutors-${child.id}`} className="flex-1">
                              Tutors
                            </Label>
                            <Switch 
                              id={`tutors-${child.id}`}
                              checked={child.apps.tutors}
                              onCheckedChange={value => handleAppAccessToggle(child.id, 'tutors', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`habits-${child.id}`} className="flex-1">
                              Habit Tracker
                            </Label>
                            <Switch 
                              id={`habits-${child.id}`}
                              checked={child.apps.habitTracker}
                              onCheckedChange={value => handleAppAccessToggle(child.id, 'habitTracker', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`journal-${child.id}`} className="flex-1">
                              Journal
                            </Label>
                            <Switch 
                              id={`journal-${child.id}`}
                              checked={child.apps.journalEntries}
                              onCheckedChange={value => handleAppAccessToggle(child.id, 'journalEntries', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`tasks-${child.id}`} className="flex-1">
                              Task Manager
                            </Label>
                            <Switch 
                              id={`tasks-${child.id}`}
                              checked={child.apps.taskManager}
                              onCheckedChange={value => handleAppAccessToggle(child.id, 'taskManager', value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api-settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Configure API keys for enhanced features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={openAIKey}
                        onChange={e => setOpenAIKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSaveAPIKey}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                            Saving
                          </>
                        ) : 'Save'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for the tutor feature. Your key will be stored securely.
                      Get your key at <a href="https://platform.openai.com/api-keys" className="text-primary hover:underline" target="_blank" rel="noreferrer">platform.openai.com/api-keys</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParentSettings;
