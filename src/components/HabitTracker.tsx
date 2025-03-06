
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useHabitAchievements } from '@/hooks/use-habit-achievements';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';

type Habit = {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
};

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Read for 20 minutes', streak: 5, completed: false },
    { id: '2', name: 'Practice an instrument', streak: 3, completed: false },
    { id: '3', name: 'Do homework', streak: 7, completed: false },
  ]);
  const [newHabit, setNewHabit] = useState('');
  
  // Use our achievements hook
  useHabitAchievements(habits);
  
  // Use notifications
  const { addNotification } = useNotifications();
  
  // Use toast
  const { toast } = useToast();

  const addHabit = () => {
    if (newHabit.trim() === '') return;
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      streak: 0,
      completed: false,
    };
    
    setHabits([...habits, habit]);
    setNewHabit('');
    
    // Show toast for feedback
    toast({
      title: "Habit Created",
      description: `New habit "${newHabit}" has been added.`,
    });
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const newCompleted = !habit.completed;
        const newStreak = newCompleted ? habit.streak + 1 : habit.streak - 1;
        
        // If completing a habit, show a notification
        if (newCompleted) {
          addNotification(
            'habit',
            'Habit Completed!',
            `You've completed "${habit.name}" - keep up the good work!`,
            habit.id
          );
          
          // Show toast for feedback
          toast({
            title: "Habit Completed",
            description: `Streak for "${habit.name}" is now ${newStreak}.`,
          });
        }
        
        return { ...habit, completed: newCompleted, streak: newStreak };
      }
      return habit;
    }));
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(habit => habit.id === id);
    setHabits(habits.filter(habit => habit.id !== id));
    
    if (habitToDelete) {
      toast({
        title: "Habit Deleted",
        description: `"${habitToDelete.name}" has been removed.`,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">My Daily Habits</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add a new habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="w-48 md:w-64"
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <Button onClick={addHabit} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border",
              habit.completed 
                ? "bg-accent/10 border-accent/30" 
                : "bg-card border-border"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                  habit.completed 
                    ? "bg-accent text-accent-foreground" 
                    : "border border-muted-foreground"
                )}
              >
                {habit.completed && <Check className="h-4 w-4" />}
              </button>
              <span className={habit.completed ? "line-through text-muted-foreground" : ""}>
                {habit.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Streak:</span>
                <span className={cn(
                  "text-sm font-bold",
                  habit.streak > 0 ? "text-accent" : "text-muted-foreground"
                )}>
                  {habit.streak}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteHabit(habit.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
        
        {habits.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No habits yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
