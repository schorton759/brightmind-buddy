
import React from 'react';
import TutorChat from './TutorChat';

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
        tutorName="Prof. Calculon"
        tutorAvatar="/tutors/math-tutor.png"
        tutorIntro="Hello! I'm Prof. Calculon, your math tutor. I can help you understand math concepts, 
        solve problems, and make math fun! What would you like to learn about today?"
      />
    </div>
  );
};

export default MathTutor;
