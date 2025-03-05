
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface TutorChatProps {
  subject: 'math' | 'language';
  ageGroup: string;
}

export const TutorChat: React.FC<TutorChatProps> = ({ subject, ageGroup }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [parentId, setParentId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // If user is a child, check if they have a parent
    if (profile?.user_type === 'child') {
      fetchParentId();
    }
  }, [profile]);

  const fetchParentId = async () => {
    try {
      const { data, error } = await supabase
        .from('family_connections')
        .select('parent_id')
        .eq('child_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data?.parent_id) {
        setParentId(data.parent_id);
      }
    } catch (error) {
      console.error('Error fetching parent:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message to chat
    const userMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMessageId, content: message, isUser: true }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Clear input
    setMessage('');
    
    try {
      setIsLoading(true);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('subject-tutor', {
        body: {
          message,
          subject,
          ageGroup,
          userId: user?.id,
          parentId: parentId
        }
      });

      if (error) throw error;
      
      // Add tutor response to chat
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        content: data.response, 
        isUser: false 
      }]);
      
    } catch (error: any) {
      console.error('Error getting response:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get tutor response"
      });
      
      // Remove the user message if we couldn't get a response
      setMessages(prev => prev.filter(m => m.id !== userMessageId));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card rounded-lg border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Bot size={48} className="mb-2 text-primary opacity-80" />
            <h3 className="text-xl font-medium mb-2">
              {subject === 'math' ? 'Math Tutor' : 'Language Tutor'}
            </h3>
            <p>Ask any {subject} question and get personalized help!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] ${
                  msg.isUser 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}
              >
                <div className={`flex-shrink-0 ${msg.isUser ? 'ml-2' : 'mr-2'}`}>
                  {msg.isUser ? (
                    <Avatar>
                      <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarImage 
                        src={subject === 'math' 
                          ? '/tutors/math-tutor.png' 
                          : '/tutors/language-tutor.png'} 
                      />
                      <AvatarFallback>
                        {subject === 'math' ? 'M' : 'L'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div 
                  className={`
                    py-2 px-3 rounded-lg 
                    ${msg.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex flex-row">
              <div className="flex-shrink-0 mr-2">
                <Avatar>
                  <AvatarImage 
                    src={subject === 'math' 
                      ? '/tutors/math-tutor.png' 
                      : '/tutors/language-tutor.png'} 
                  />
                  <AvatarFallback>
                    {subject === 'math' ? 'M' : 'L'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="py-2 px-3 rounded-lg bg-muted">
                <div className="flex space-x-1 items-center h-6">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask the ${subject} tutor a question...`}
            className="min-h-[2.5rem] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !message.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};
