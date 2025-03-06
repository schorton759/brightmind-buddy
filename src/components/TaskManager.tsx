
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTaskAchievements } from '@/hooks/use-task-achievements';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Finish math homework', completed: false, priority: 'high' },
    { id: '2', title: 'Practice piano for 30 minutes', completed: false, priority: 'medium' },
    { id: '3', title: 'Clean room', completed: false, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');

  // Use our achievements hook
  useTaskAchievements(tasks);
  
  // Use notifications
  const { addNotification } = useNotifications();
  
  // Use toast
  const { toast } = useToast();

  const addTask = () => {
    if (newTask.trim() === '') return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: newPriority,
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
    
    // Show toast for feedback
    toast({
      title: "Task Created",
      description: `New ${newPriority} priority task has been added.`,
    });
    
    // If high priority, show a notification
    if (newPriority === 'high') {
      addNotification(
        'task',
        'High Priority Task',
        `You've added a high priority task: ${newTask}`,
        task.id
      );
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        
        // If completing a task, show a notification
        if (newCompleted) {
          addNotification(
            'task',
            'Task Completed!',
            `You've completed "${task.title}" - great job!`,
            task.id
          );
          
          // Show toast for feedback
          toast({
            title: "Task Completed",
            description: `"${task.title}" has been marked as completed.`,
          });
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.title}" has been removed.`,
      });
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">My Tasks</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-48 md:w-64"
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
            className="border rounded-md px-2 bg-background"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button onClick={addTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border",
              task.completed 
                ? "bg-secondary/50 border-secondary" 
                : "bg-card border-border"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                  task.completed 
                    ? "bg-primary text-primary-foreground" 
                    : "border border-muted-foreground"
                )}
              >
                {task.completed && <Check className="h-4 w-4" />}
              </button>
              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                priorityColors[task.priority]
              )}>
                {task.priority}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteTask(task.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            All done! Add a task to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
