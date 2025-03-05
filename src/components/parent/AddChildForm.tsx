
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddChildFormProps {
  onComplete: () => void;
}

const AddChildForm = ({ onComplete }: AddChildFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !ageGroup || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Create the child account with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: firstName,
            user_type: 'child',
            age_group: ageGroup
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }
      
      // 2. Create the family connection in the database
      const { error: connectionError } = await supabase
        .from('family_connections')
        .insert({
          parent_id: profile?.id,
          child_id: data.user.id
        });
      
      if (connectionError) throw connectionError;
      
      // Store credentials to show to parent
      setCredentials({ email, password });
      
      toast({
        title: "Child account created!",
        description: "The account has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating child account:', error);
      setError(error.message || 'Failed to create child account');
      setCredentials(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (credentials) {
    return (
      <Card className="p-6 border-green-200 bg-green-50">
        <h3 className="text-lg font-bold mb-4">Child Account Created!</h3>
        <p className="mb-4">Please save these credentials to share with your child:</p>
        <div className="space-y-2 mb-6">
          <div className="bg-white p-3 rounded border">
            <p className="font-medium">Email:</p>
            <p className="text-sm">{credentials.email}</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="font-medium">Password:</p>
            <p className="text-sm">{credentials.password}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Make sure to save these details before closing this window.
        </p>
        <div className="flex justify-end">
          <Button onClick={onComplete}>Done</Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Child's First Name</Label>
        <Input 
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age-group">Age Group</Label>
        <Select 
          value={ageGroup} 
          onValueChange={setAgeGroup}
          disabled={isLoading}
        >
          <SelectTrigger id="age-group">
            <SelectValue placeholder="Select age group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8-10">8-10 years</SelectItem>
            <SelectItem value="10-12">10-12 years</SelectItem>
            <SelectItem value="13-15">13-15 years</SelectItem>
            <SelectItem value="15+">15+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email for login"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          disabled={isLoading}
        />
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onComplete}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default AddChildForm;
