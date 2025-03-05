
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AgeGroupSelector from '@/components/AgeGroupSelector';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

type AgeGroup = '8-10' | '10-12' | '13-15' | '15+';

const UserAgeSelector = ({ onSelectComplete }: { onSelectComplete: () => void }) => {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  const [isUpdatingAgeGroup, setIsUpdatingAgeGroup] = useState(false);

  const handleSelectAgeGroup = async (group: string) => {
    if (!user || isUpdatingAgeGroup) return;
    
    setIsUpdatingAgeGroup(true);
    
    try {
      console.log(`Updating age group to ${group} for user ID: ${user.id}`);
      
      const updatedProfile = await updateProfile({ age_group: group as AgeGroup });
      
      if (updatedProfile) {
        // Transition to dashboard
        onSelectComplete();
      }
    } catch (error: any) {
      console.error('Failed to update age group:', error);
      toast({
        variant: "destructive",
        title: "Failed to update age group",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsUpdatingAgeGroup(false);
    }
  };

  return (
    <motion.div
      key="age-select"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center"
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to BrightMind Buddy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personal AI life coach to help you build great habits, stay organized, and achieve your goals.
        </p>
      </motion.div>
      
      <div className="w-full">
        <AgeGroupSelector 
          selectedGroup={profile?.age_group || ''} 
          onSelectGroup={handleSelectAgeGroup}
          isLoading={isUpdatingAgeGroup}
        />
      </div>
    </motion.div>
  );
};

export default UserAgeSelector;
