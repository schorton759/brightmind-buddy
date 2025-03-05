
import React from 'react';

interface TutorEmptyStateProps {
  subject: string;
}

export function TutorEmptyState({ subject }: TutorEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-lg font-medium">
          Welcome to the {subject.charAt(0).toUpperCase() + subject.slice(1)} Tutor!
        </h3>
        <p className="text-muted-foreground">
          Ask any question about {subject} and get personalized help from your AI tutor.
        </p>
      </div>
    </div>
  );
}
