import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthOperations = (setIsLoading: (value: boolean) => void) => {
  const { toast } = useToast();

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    userType: 'child' | 'parent', 
    ageGroup?: string
  ) => {
    try {
      setIsLoading(true);
      console.log("Signing up user with data:", { email, username, userType, ageGroup });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            user_type: userType,
            age_group: ageGroup
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup successful:", data);
      toast({
        title: "Account created successfully!",
        description: "You're now signed in.",
      });
    } catch (error: any) {
      console.error("Error in signUp function:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Signing in user:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      console.error("Error in signIn function:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createChildCredentials = async (childId: string, username: string, ageGroup?: string | null) => {
    try {
      setIsLoading(true);
      console.log("Creating credentials for child:", { childId, username, ageGroup });
      
      const { data, error } = await supabase.functions.invoke('create-child-credentials', {
        body: {
          childId,
          username,
          ageGroup
        }
      });

      if (error) {
        console.error("Error creating child credentials:", error);
        throw error;
      }
      
      console.log("Child credentials created successfully:", data);
      toast({
        title: "Credentials created successfully!",
        description: "Save these credentials for your child to log in.",
      });
      
      return data;
    } catch (error: any) {
      console.error("Error in createChildCredentials function:", error);
      toast({
        variant: "destructive",
        title: "Failed to create credentials",
        description: error.message || "An unexpected error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    createChildCredentials
  };
};
