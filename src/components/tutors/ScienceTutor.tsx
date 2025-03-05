
import React from 'react';
import { TutorChat } from './TutorChat';
import { useAuth } from '@/context/AuthContext';

const ScienceTutor = () => {
  const { profile } = useAuth();
  const ageGroup = profile?.age_group || 'elementary';

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Science Tutor</h1>
      <p className="mb-6 text-muted-foreground">
        Ask any science question and get help from your AI tutor.
      </p>
      
      <TutorChat subject="science" ageGroup={ageGroup} />
    </div>
  );
};

export default ScienceTutor;
