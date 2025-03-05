
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TutorCardProps {
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
}

const TutorCard: React.FC<TutorCardProps> = ({ title, description, imageSrc, onClick }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={imageSrc} 
          alt={title} 
          className="h-full w-full object-cover" 
        />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onClick} className="w-full">Talk to Tutor</Button>
      </CardFooter>
    </Card>
  );
};

const TutorsHub: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learning Tutors</h1>
        <p className="text-muted-foreground">
          Get personalized help from our AI tutors in different subjects
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <TutorCard 
          title="Math Tutor" 
          description="Get help with math concepts, problem-solving, and more"
          imageSrc="/tutors/math-tutor.png"
          onClick={() => navigate('/tutors/math')}
        />
        <TutorCard 
          title="Language Tutor" 
          description="Improve reading, writing, vocabulary, and grammar"
          imageSrc="/tutors/language-tutor.png" 
          onClick={() => navigate('/tutors/language')}
        />
      </div>
    </div>
  );
};

export default TutorsHub;
