
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface TutorChatInputProps {
  isProcessing: boolean;
  subject: string;
  onSendMessage: (message: string) => void;
  showApiKeyWarning?: boolean;
}

export function TutorChatInput({ 
  isProcessing, 
  subject, 
  onSendMessage,
  showApiKeyWarning = false 
}: TutorChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask a question about ${subject}...`}
          className="resize-none"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || isProcessing}
          className="shrink-0"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {showApiKeyWarning && (
        <p className="text-xs text-muted-foreground mt-2">
          Note: For the best experience, ask your parent to add their OpenAI API key in parent settings.
        </p>
      )}
    </div>
  );
}
