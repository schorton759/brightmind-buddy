
import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TutorChatMessageProps {
  message: Message;
}

export function TutorChatMessage({ message }: TutorChatMessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div 
          className={`text-xs mt-1 ${
            message.role === 'user' 
              ? 'text-primary-foreground/70' 
              : 'text-muted-foreground'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
