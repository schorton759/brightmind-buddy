
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
};

const AgeGroupSelector = ({ selectedGroup, onSelectGroup, className }: AgeGroupSelectorProps) => {
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <h2 className="text-xl font-medium mb-4 text-center">Select Your Age Group</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ageGroups.map((group) => (
          <motion.button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
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
          >
            <h3 className="text-lg font-medium">{group.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AgeGroupSelector;
