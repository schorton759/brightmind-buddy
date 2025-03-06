
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Calculator, Flask } from 'lucide-react'; // Adding icons instead of relying on missing images

interface TutorCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const TutorCard: React.FC<TutorCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-4xl text-primary">
          {icon}
        </div>
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
          icon={<Calculator className="h-16 w-16" />}
          onClick={() => navigate('/tutors/math')}
        />
        <TutorCard 
          title="Language Tutor" 
          description="Improve reading, writing, vocabulary, and grammar"
          icon={<Book className="h-16 w-16" />} 
          onClick={() => navigate('/tutors/language')}
        />
        <TutorCard 
          title="Science Tutor" 
          description="Learn about science topics, experiments, and more"
          icon={<Flask className="h-16 w-16" />}
          onClick={() => navigate('/tutors/science')}
        />
      </div>
    </div>
  );
};

export default TutorsHub;
