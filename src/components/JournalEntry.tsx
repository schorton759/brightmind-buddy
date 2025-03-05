
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type JournalEntryProps = {
  ageGroup: string;
};

const getPromptForAge = (ageGroup: string): string => {
  switch (ageGroup) {
    case '8-10':
      return 'What was the best part of your day? What made you smile today?';
    case '10-12':
      return 'What is something you learned today? What are you grateful for?';
    case '13-15':
      return 'What challenges did you face today and how did you overcome them?';
    case '15+':
      return 'What progress did you make on your goals today? What could you improve tomorrow?';
    default:
      return 'How was your day? Write down your thoughts and feelings.';
  }
};

const JournalEntry = ({ ageGroup }: JournalEntryProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  
  const prompt = getPromptForAge(ageGroup);

  const handleSave = () => {
    if (entry.trim() === '') return;
    console.log('Saving journal entry:', { date, entry });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-medium">My Journal</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{format(date, 'PPP')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-4 bg-secondary rounded-lg">
          <p className="text-sm font-medium text-muted-foreground">{prompt}</p>
        </div>

        <Textarea
          placeholder="Write your journal entry here..."
          className="min-h-[200px] resize-none"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
            disabled={entry.trim() === ''}
          >
            <Save className="h-4 w-4" />
            <span>{saved ? 'Saved!' : 'Save Entry'}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalEntry;
