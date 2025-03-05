
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthHeader from '@/components/auth/AuthHeader';

const Auth = () => {
  const { user, signIn, signUp, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AuthHeader />

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
                <SignInForm onSubmit={signIn} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="sign-up">
                <SignUpForm onSubmit={signUp} isLoading={isLoading} />
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
