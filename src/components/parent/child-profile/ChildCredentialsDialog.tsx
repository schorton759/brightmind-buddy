
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type ChildCredentials = {
  email: string;
  password: string;
  username: string;
};

interface ChildCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: ChildCredentials | null;
}

const ChildCredentialsDialog = ({ 
  open, 
  onOpenChange, 
  credentials 
}: ChildCredentialsDialogProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Credentials</DialogTitle>
          <DialogDescription>
            Save these login details for {credentials?.username}. You will need them for your child to log in.
          </DialogDescription>
        </DialogHeader>
        
        {credentials && (
          <div className="bg-secondary p-4 rounded-md space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Username:</span>
              <div className="flex items-center">
                <span>{credentials.username}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 ml-1"
                  onClick={() => copyToClipboard(credentials.username)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Email:</span>
              <div className="flex items-center">
                <span>{credentials.email}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 ml-1"
                  onClick={() => copyToClipboard(credentials.email)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Password:</span>
              <div className="flex items-center">
                <span>{credentials.password}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 ml-1"
                  onClick={() => copyToClipboard(credentials.password)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChildCredentialsDialog;
