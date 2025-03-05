
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Sparkles } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  
  // Form state for sign in
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Form state for sign up
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpUserType, setSignUpUserType] = useState<'child' | 'parent'>('child');
  const [signUpAgeGroup, setSignUpAgeGroup] = useState<string>('');
  
  // Error handling
  const [error, setError] = useState('');
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(signInEmail, signInPassword);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!signUpEmail || !signUpPassword || !signUpUsername || !signUpUserType) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (signUpUserType === 'child' && !signUpAgeGroup) {
      setError('Please select an age group');
      return;
    }
    
    try {
      await signUp(
        signUpEmail, 
        signUpPassword, 
        signUpUsername, 
        signUpUserType, 
        signUpUserType === 'child' ? signUpAgeGroup : undefined
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            BrightMind Buddy
            <Sparkles className="h-6 w-6 text-accent animate-pulse-soft" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal AI life coach
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {authMode === 'sign-in' ? 'Welcome Back!' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {authMode === 'sign-in' 
                ? 'Sign in to your account to continue' 
                : 'Fill in your details to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'sign-in' | 'sign-up')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign-in">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="sign-up">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-email">Email</Label>
                    <Input 
                      id="sign-up-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-username">Username</Label>
                    <Input 
                      id="sign-up-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signUpUsername}
                      onChange={(e) => setSignUpUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-password">Password</Label>
                    <Input 
                      id="sign-up-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-type">I am a...</Label>
                    <Select 
                      value={signUpUserType} 
                      onValueChange={(value) => setSignUpUserType(value as 'child' | 'parent')}
                    >
                      <SelectTrigger id="user-type">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {signUpUserType === 'child' && (
                    <div className="space-y-2">
                      <Label htmlFor="age-group">Age Group</Label>
                      <Select 
                        value={signUpAgeGroup} 
                        onValueChange={setSignUpAgeGroup}
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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
