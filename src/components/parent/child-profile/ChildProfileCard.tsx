
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Info, Key, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

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

interface ChildProfileCardProps {
  child: ChildProfile;
  onDelete: (childId: string) => Promise<void>;
  onCreateCredentials: (child: ChildProfile) => Promise<void>;
  onViewCredentials: (child: ChildProfile) => void;
  isCreatingCredentials: boolean;
  selectedChildId: string | null;
}

const ChildProfileCard = ({ 
  child, 
  onDelete, 
  onCreateCredentials, 
  onViewCredentials, 
  isCreatingCredentials, 
  selectedChildId 
}: ChildProfileCardProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard."
    });
  };

  return (
    <Card key={child.id}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{child.username}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-3">
          <Badge variant="outline">
            {child.age_group ? `Age: ${child.age_group}` : 'Age not set'}
          </Badge>
          
          {child.credentials && (
            <div className="mt-3 bg-secondary/50 p-3 rounded-md space-y-2 text-sm">
              <h4 className="font-semibold flex items-center gap-1">
                <Info className="h-4 w-4" />
                Login Details
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Username:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{child.credentials.username}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(child.credentials.username)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{child.credentials.email}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(child.credentials.email)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Password:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{child.credentials.password}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(child.credentials.password)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                onClick={() => onDelete(child.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {!child.credentials ? (
          <Button 
            onClick={() => onCreateCredentials(child)}
            disabled={isCreatingCredentials && selectedChildId === child.id}
          >
            <Key className="h-4 w-4 mr-2" />
            {isCreatingCredentials && selectedChildId === child.id 
              ? 'Creating...' 
              : 'Create Login'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => onViewCredentials(child)}
          >
            <Key className="h-4 w-4 mr-2" />
            View Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChildProfileCard;
