
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const AppAccessControls = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [childProfiles, setChildProfiles] = useState<ChildAppAccess[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchChildProfiles();
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
        if (profiles && profiles.length > 0) {
          const { data: appSettings, error: appSettingsError } = await supabase
            .from('child_app_settings')
            .select('*')
            .in('child_id', childIds);
            
          if (appSettingsError) throw appSettingsError;
          
          // Combine profiles with their settings
          const childrenWithAccess = profiles.map(child => {
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

  return (
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
  );
};

export default AppAccessControls;
