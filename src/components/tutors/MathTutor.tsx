
import React from 'react';
import { TutorChat } from './TutorChat';

const MathTutor: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Math Tutor</h1>
        <p className="text-muted-foreground">
          Get help with math problems, learn new concepts, and practice your skills.
        </p>
      </div>
      
      <TutorChat 
        subject="math"
        ageGroup={localStorage.getItem('user_age_group') || '13-15'}
      />
    </div>
  );
};

export default MathTutor;
