
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, LogIn } from 'lucide-react';

interface ChildProfile {
  id: string;
  username: string;
  age_group: string;
  email?: string;
}

const ChildProfilesList = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!profile?.id) return;
      
      try {
        // Get family connections for this parent
        const { data: connections, error: connectionsError } = await supabase
          .from('family_connections')
          .select('child_id')
          .eq('parent_id', profile.id);
        
        if (connectionsError) throw connectionsError;
        
        if (!connections || connections.length === 0) {
          setChildren([]);
          setIsLoading(false);
          return;
        }
        
        // Get child profiles
        const childIds = connections.map(conn => conn.child_id);
        const { data: childProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, age_group')
          .in('id', childIds);
        
        if (profilesError) throw profilesError;
        
        // Get email addresses from auth.users (if available)
        // Note: This might require additional permissions
        const childrenWithEmail = childProfiles || [];
        
        setChildren(childrenWithEmail);
      } catch (error: any) {
        console.error('Error fetching children:', error);
        toast({
          variant: "destructive",
          title: "Failed to load child profiles",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChildren();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center p-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No child profiles yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your child's information to create their BrightMind Buddy account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {children.map((child) => (
        <Card key={child.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{child.username}</h3>
                <p className="text-sm text-muted-foreground">
                  Age group: {child.age_group}
                </p>
              </div>
              <Button variant="ghost" size="icon" title="View full details">
                <LogIn className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChildProfilesList;
