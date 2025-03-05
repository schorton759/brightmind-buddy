
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import AddChildForm from './AddChildForm';
import ChildProfilesList from './ChildProfilesList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ParentDashboard = ({ onViewChildDashboard }: { onViewChildDashboard?: (childId: string, username: string) => void }) => {
  const { profile } = useAuth();
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const refreshChildProfiles = () => {
    setIsLoading(true);
    setRefreshTrigger(prev => prev + 1);
    
    // Add a small delay to allow the database to update
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Refreshed",
        description: "Child profiles have been refreshed",
      });
    }, 500);
  };

  const handleViewChildDashboard = (childId: string, username: string) => {
    if (onViewChildDashboard) {
      onViewChildDashboard(childId, username);
    } else {
      toast({
        title: "Feature not available",
        description: "Viewing child dashboard will be available soon",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {profile?.username}
        </h1>
        <p className="text-muted-foreground">Manage your child's BrightMind Buddy account</p>
      </motion.div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Child Profiles</CardTitle>
                <CardDescription>Create and manage accounts for your children</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={refreshChildProfiles}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  onClick={() => setShowAddChildForm(true)} 
                  className="flex items-center gap-2"
                  disabled={showAddChildForm}
                >
                  <Plus className="h-4 w-4" />
                  Add Child
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showAddChildForm ? (
              <AddChildForm 
                onComplete={() => {
                  setShowAddChildForm(false);
                  refreshChildProfiles();
                }} 
              />
            ) : (
              <ChildProfilesList 
                refreshTrigger={refreshTrigger} 
                onCreateCredentials={(childId) => {
                  // We'll implement this functionality in the ChildProfilesList component
                }}
                onViewChildDashboard={handleViewChildDashboard}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
