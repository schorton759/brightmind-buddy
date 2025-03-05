
import React from 'react';
import { TutorChat } from './TutorChat';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ScienceTutor = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const ageGroup = profile?.age_group || 'elementary';

  return (
    <div className="container max-w-4xl mx-auto p-4">
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
          <h1 className="text-3xl font-bold mb-2">Science Tutor</h1>
          <p className="text-muted-foreground">
            Ask any science question and get help from your AI tutor.
          </p>
        </div>
      </div>
      
      <TutorChat subject="science" ageGroup={ageGroup} />
    </div>
  );
};

export default ScienceTutor;
