import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Key, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';

type ChildProfile = {
  id: string;
  username: string;
  age_group: string | null;
};

type ChildCredentials = {
  email: string;
  password: string;
  username: string;
};

const ChildProfilesList = ({ refreshTrigger, onCreateCredentials }: { 
  refreshTrigger: number;
  onCreateCredentials: (childId: string) => void; 
}) => {
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
      setCredentials({
        email: result.credentials.email,
        password: result.credentials.password,
        username: result.credentials.username
      });
      
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (childProfiles.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No child profiles yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a child profile to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {childProfiles.map(child => (
        <Card key={child.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{child.username}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {child.age_group ? `Age: ${child.age_group}` : 'Age not set'}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the connection between your account and your child's profile.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteChild(child.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              onClick={() => handleCreateCredentials(child)}
              disabled={creatingCredentials && selectedChild?.id === child.id}
            >
              <Key className="h-4 w-4 mr-2" />
              {creatingCredentials && selectedChild?.id === child.id 
                ? 'Creating...' 
                : 'Create Login'}
            </Button>
          </CardFooter>
        </Card>
      ))}

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Credentials</DialogTitle>
            <DialogDescription>
              Save these login details for {credentials?.username}. You will need them for your child to log in.
            </DialogDescription>
          </DialogHeader>
          
          {credentials && (
            <div className="bg-secondary p-4 rounded-md space-y-2 font-mono text-sm">
              <div>
                <span className="font-semibold">Username:</span> {credentials.username}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {credentials.email}
              </div>
              <div>
                <span className="font-semibold">Password:</span> {credentials.password}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowCredentialsDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildProfilesList;
