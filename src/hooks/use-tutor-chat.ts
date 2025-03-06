
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppAccess } from '@/hooks/use-app-access';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/tutors/TutorChatMessage';

interface UseTutorChatProps {
  subject: 'math' | 'language' | 'science';
  ageGroup: string;
  parentApiKey: string | null;
}

export function useTutorChat({ subject, ageGroup, parentApiKey }: UseTutorChatProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { hasAccess } = useAppAccess();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Clear any previous errors
    setError(null);
    
    // Check app access for child users
    if (profile?.user_type === 'child' && !hasAccess('tutors')) {
      toast({
        variant: "destructive",
        title: "Access Restricted",
        description: "You don't have access to this feature. Ask your parent to enable it."
      });
      return;
    }
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('subject-tutor', {
        body: {
          userId: profile?.id,
          message: userMessage.content,
          subject,
          ageGroup,
          apiKey: parentApiKey // Pass parent's API key if available
        }
      });
      
      if (functionError) {
        console.error('Error sending message to tutor:', functionError);
        setError("Failed to connect to the tutor service. Please try again.");
        return;
      }
      
      if (data.error) {
        console.error('Tutor service returned an error:', data.error);
        setError(data.error);
        return;
      }
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to tutor:', error);
      setError("An unexpected error occurred. Please try again later.");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the tutor. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    messagesEndRef,
    error
  };
}
