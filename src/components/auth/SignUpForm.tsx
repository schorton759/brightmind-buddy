
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, username: string, userType: 'child' | 'parent', ageGroup?: string) => Promise<void>;
  isLoading: boolean;
}

const SignUpForm = ({ onSubmit, isLoading }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState<'child' | 'parent'>('child');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !password || !username || !userType) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (userType === 'child' && !ageGroup) {
      setError('Please select an age group');
      return;
    }
    
    try {
      setMessage('Creating your account... Please wait.');
      await onSubmit(
        email, 
        password, 
        username, 
        userType, 
        userType === 'child' ? ageGroup : undefined
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'An error occurred during sign up');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sign-up-email">Email</Label>
        <Input 
          id="sign-up-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sign-up-username">
          {userType === 'parent' ? 'Full Name' : 'Username'}
        </Label>
        <Input 
          id="sign-up-username"
          type="text"
          placeholder={userType === 'parent' ? "Enter your full name" : "Choose a username"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sign-up-password">Password</Label>
        <Input 
          id="sign-up-password"
          type="password"
          placeholder="Create a secure password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="user-type">I am a...</Label>
        <Select 
          value={userType} 
          onValueChange={(value) => setUserType(value as 'child' | 'parent')}
        >
          <SelectTrigger id="user-type">
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="child">Child</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
          </SelectContent>
        </Select>
        {userType === 'parent' && (
          <p className="text-xs text-muted-foreground mt-1">
            Parents can create and manage child accounts
          </p>
        )}
      </div>
      
      {userType === 'child' && (
        <div className="space-y-2">
          <Label htmlFor="age-group">Age Group</Label>
          <Select 
            value={ageGroup} 
            onValueChange={setAgeGroup}
          >
            <SelectTrigger id="age-group">
              <SelectValue placeholder="Select your age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8-10">8-10 years</SelectItem>
              <SelectItem value="10-12">10-12 years</SelectItem>
              <SelectItem value="13-15">13-15 years</SelectItem>
              <SelectItem value="15+">15+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignUpForm;
