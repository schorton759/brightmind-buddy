
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddChildForm from './AddChildForm';
import ChildProfilesList from './ChildProfilesList';

const ParentDashboard = () => {
  const { profile } = useAuth();
  const [showAddChildForm, setShowAddChildForm] = useState(false);

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
              <Button 
                onClick={() => setShowAddChildForm(true)} 
                className="flex items-center gap-2"
                disabled={showAddChildForm}
              >
                <Plus className="h-4 w-4" />
                Add Child
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddChildForm ? (
              <AddChildForm onComplete={() => setShowAddChildForm(false)} />
            ) : (
              <ChildProfilesList />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
