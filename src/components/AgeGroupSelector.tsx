
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const ageGroups = [
  { id: '8-10', label: '8-10 years', description: 'Early childhood development' },
  { id: '10-12', label: '10-12 years', description: 'Pre-teen growth' },
  { id: '13-15', label: '13-15 years', description: 'Teen development' },
  { id: '15+', label: '15+ years', description: 'Young adult guidance' },
];

type AgeGroupSelectorProps = {
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  className?: string;
  isLoading?: boolean;
};

const AgeGroupSelector = ({ 
  selectedGroup, 
  onSelectGroup, 
  className,
  isLoading = false
}: AgeGroupSelectorProps) => {
  const { toast } = useToast();

  const handleSelectGroup = (groupId: string) => {
    if (isLoading) return;
    
    // Immediately call the parent component's handler
    onSelectGroup(groupId);
    
    // Show toast notification
    toast({
      title: "Age group selected",
      description: "Updating your profile...",
    });
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <h2 className="text-xl font-medium mb-4 text-center">Select Your Age Group</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ageGroups.map((group) => (
          <motion.button
            key={group.id}
            onClick={() => handleSelectGroup(group.id)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300",
              "hover:border-accent/50 card-hover",
              selectedGroup === group.id
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border bg-card"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: parseInt(group.id) * 0.1 }}
            disabled={isLoading}
          >
            <h3 className="text-lg font-medium">{group.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            {selectedGroup === group.id && isLoading && (
              <div className="mt-2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            )}
          </motion.button>
        ))}
      </div>
      {isLoading && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Updating your profile...
        </div>
      )}
    </div>
  );
};

export default AgeGroupSelector;
