
import React from 'react';
import { TutorChat } from './TutorChat';

const LanguageTutor: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Language Tutor</h1>
        <p className="text-muted-foreground">
          Improve your reading, writing, vocabulary, and grammar with personalized guidance.
        </p>
      </div>
      
      <TutorChat 
        subject="language"
        ageGroup={localStorage.getItem('user_age_group') || '13-15'}
      />
    </div>
  );
};

export default LanguageTutor;
