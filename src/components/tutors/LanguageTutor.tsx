
import React from 'react';
import TutorChat from './TutorChat';

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
        tutorName="Ms. Wordsmith"
        tutorAvatar="/tutors/language-tutor.png"
        tutorIntro="Hi there! I'm Ms. Wordsmith, your language tutor. I'm here to help you with reading, 
        writing, vocabulary, grammar, and more. What would you like help with today?"
      />
    </div>
  );
};

export default LanguageTutor;
