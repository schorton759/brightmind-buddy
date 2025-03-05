
import React from 'react';
import { TutorChat } from './TutorChat';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MathTutor: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const ageGroup = profile?.age_group || '13-15';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/tutors')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Math Tutor</h1>
          <p className="text-muted-foreground">
            Get help with math problems, learn new concepts, and practice your skills.
          </p>
        </div>
      </div>
      
      <TutorChat 
        subject="math"
        ageGroup={ageGroup}
      />
    </div>
  );
};

export default MathTutor;
