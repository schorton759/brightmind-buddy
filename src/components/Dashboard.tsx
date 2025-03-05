import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ListTodo, 
  BookOpen, 
  Activity, 
  Award, 
  Users, 
  Settings,
  Sparkles,
  BarChart,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type DashboardProps = {
  ageGroup: string;
  username: string;
  onNavigate: (page: string) => void;
};

const Dashboard = ({ ageGroup, username, onNavigate }: DashboardProps) => {
  const getGreetingForAge = (ageGroup: string): string => {
    switch (ageGroup) {
      case '8-10':
        return `Hi ${username}! Ready for a fun day?`;
      case '10-12':
        return `Hello ${username}! What would you like to accomplish today?`;
      case '13-15':
        return `Hey ${username}! Ready to make some progress today?`;
      case '15+':
        return `Welcome back, ${username}. Let's make today count.`;
      default:
        return `Hello ${username}! Welcome to your dashboard.`;
    }
  };

  const menuItems = [
    { id: 'habits', label: 'Habits', icon: <Activity className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600' },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600' },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo className="h-5 w-5" />, color: 'bg-green-50 text-green-600' },
    { id: 'rewards', label: 'Rewards', icon: <Award className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600', disabled: true },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" />, color: 'bg-red-50 text-red-600', disabled: true },
    { id: 'parents', label: 'Parents', icon: <Users className="h-5 w-5" />, color: 'bg-teal-50 text-teal-600', disabled: true },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, color: 'bg-gray-50 text-gray-600', disabled: true },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          {getGreetingForAge(ageGroup)}
          <Sparkles className="h-6 w-6 text-accent animate-pulse-soft" />
        </h1>
        <p className="text-muted-foreground">What would you like to work on today?</p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {menuItems.map((menuItem) => (
          <motion.div key={menuItem.id} variants={itemAnimation}>
            <Button
              variant="outline"
              onClick={() => !menuItem.disabled && onNavigate(menuItem.id)}
              className={cn(
                "w-full h-32 flex flex-col items-center justify-center gap-3 rounded-xl border",
                "transition-all duration-300 card-hover",
                menuItem.disabled ? "opacity-60 cursor-not-allowed" : "",
                menuItem.color
              )}
              disabled={menuItem.disabled}
            >
              <div className="text-2xl">{menuItem.icon}</div>
              <span className="font-medium">{menuItem.label}</span>
              {menuItem.disabled && (
                <span className="text-xs">Coming soon</span>
              )}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 p-4 rounded-lg bg-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="font-medium mb-2">Today's Coach Tip:</h3>
        <p className="text-sm text-muted-foreground">
          Small, consistent actions lead to big results. Try to complete at least one habit today!
        </p>
      </motion.div>

      <Card 
        className="hover:border-primary cursor-pointer transition-all"
        onClick={() => onNavigate('tutors')}
      >
        <CardHeader className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Learning Tutors</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <CardDescription>Get help from our AI tutors in math and language skills</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
