
import React from 'react';
import { User } from 'lucide-react';

const EmptyChildProfilesList = () => {
  return (
    <div className="text-center py-8">
      <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No child profiles yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a child profile to get started
      </p>
    </div>
  );
};

export default EmptyChildProfilesList;
