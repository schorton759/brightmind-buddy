
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

type ChildCredentials = {
  email: string;
  password: string;
  username: string;
};

type ChildProfile = {
  id: string;
  username: string;
  age_group: string | null;
  credentials?: ChildCredentials | null;
};

export const useChildProfiles = (refreshTrigger: number) => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState<ChildCredentials | null>(null);
  const [creatingCredentials, setCreatingCredentials] = useState(false);
  const { toast } = useToast();
  const { user, createChildCredentials } = useAuth();

  useEffect(() => {
    fetchChildProfiles();
  }, [refreshTrigger]);

  const fetchChildProfiles = async () => {
    try {
      setLoading(true);
      
      const { data: connections, error: connectionsError } = await supabase
        .from('family_connections')
        .select('child_id')
        .eq('parent_id', user?.id);
      
      if (connectionsError) throw connectionsError;
      
      if (connections && connections.length > 0) {
        const childIds = connections.map(connection => connection.child_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, age_group')
          .in('id', childIds);
        
        if (profilesError) throw profilesError;
        
        setChildProfiles(profiles || []);
      } else {
        setChildProfiles([]);
      }
    } catch (error: any) {
      console.error('Error fetching child profiles:', error.message);
      toast({
        variant: "destructive",
        title: "Error fetching child profiles",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredentials = async (child: ChildProfile) => {
    try {
      setSelectedChild(child);
      setCreatingCredentials(true);
      
      if (!createChildCredentials) {
        throw new Error("Create credentials function not available");
      }
      
      const result = await createChildCredentials(
        child.id, 
        child.username, 
        child.age_group
      );
      
      // Store the credentials to show to the parent
      const newCredentials = {
        email: result.credentials.email,
        password: result.credentials.password,
        username: result.credentials.username
      };
      
      setCredentials(newCredentials);
      
      // Update the child profile with credentials
      setChildProfiles(prev => 
        prev.map(p => 
          p.id === child.id 
            ? { ...p, credentials: newCredentials } 
            : p
        )
      );
      
      setShowCredentialsDialog(true);
      
      toast({
        title: "Credentials created",
        description: "Login credentials have been created for your child.",
      });
    } catch (error: any) {
      console.error('Error creating credentials:', error.message);
      toast({
        variant: "destructive",
        title: "Failed to create credentials",
        description: error.message || "Please try again later.",
      });
    } finally {
      setCreatingCredentials(false);
    }
  };

  const handleViewCredentials = (child: ChildProfile) => {
    setSelectedChild(child);
    setCredentials(child.credentials || null);
    setShowCredentialsDialog(true);
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      // Delete the family connection
      const { error } = await supabase
        .from('family_connections')
        .delete()
        .eq('child_id', childId)
        .eq('parent_id', user?.id);
      
      if (error) throw error;
      
      // Remove from local state
      setChildProfiles(prev => prev.filter(child => child.id !== childId));
      
      toast({
        title: "Child profile removed",
        description: "The child profile has been removed from your account.",
      });
    } catch (error: any) {
      console.error('Error deleting child profile:', error.message);
      toast({
        variant: "destructive",
        title: "Failed to delete child profile",
        description: error.message || "Please try again later.",
      });
    }
  };

  return {
    childProfiles,
    loading,
    selectedChild,
    showCredentialsDialog,
    setShowCredentialsDialog,
    credentials,
    creatingCredentials,
    handleCreateCredentials,
    handleViewCredentials,
    handleDeleteChild
  };
};
