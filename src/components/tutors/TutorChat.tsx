
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAppAccess } from '@/hooks/use-app-access';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TutorChatProps {
  subject: 'math' | 'language' | 'science';
  ageGroup: string;
}

export function TutorChat({ subject, ageGroup }: TutorChatProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { hasAccess, isLoading: isCheckingAccess } = useAppAccess();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parentApiKey, setParentApiKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // If child user, check if a parent has provided an OpenAI API key
    if (profile?.user_type === 'child') {
      fetchParentApiKey();
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchParentApiKey = async () => {
    try {
      // First, find the parent of this child
      const { data: connections, error: connectionsError } = await supabase
        .from('family_connections')
        .select('parent_id')
        .eq('child_id', profile?.id)
        .single();
        
      if (connectionsError) {
        console.error('Error fetching parent connection:', connectionsError);
        return;
      }
      
      if (!connections?.parent_id) return;
      
      // Then, fetch the parent's API key
      const { data: settings, error: settingsError } = await supabase
        .from('parent_settings')
        .select('openai_key')
        .eq('parent_id', connections.parent_id)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching parent API key:', settingsError);
        return;
      }
      
      if (settings?.openai_key) {
        setParentApiKey(settings.openai_key);
      }
    } catch (error) {
      console.error('Error in fetchParentApiKey:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
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
    setMessage('');
    setIsProcessing(true);
    
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('subject-tutor', {
        body: {
          userId: profile?.id,
          message: userMessage.content,
          subject,
          ageGroup,
          apiKey: parentApiKey // Pass parent's API key if available
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        toast({
          variant: "destructive",
          title: "Tutor Error",
          description: data.error
        });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the tutor. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For child users, check access
  if (profile?.user_type === 'child' && !hasAccess('tutors')) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground">
          Your parent has disabled access to the tutors. 
          Please ask them to enable it in the parent settings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col h-[70vh] md:h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 max-w-md">
                <h3 className="text-lg font-medium">
                  Welcome to the {subject.charAt(0).toUpperCase() + subject.slice(1)} Tutor!
                </h3>
                <p className="text-muted-foreground">
                  Ask any question about {subject} and get personalized help from your AI tutor.
                </p>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      msg.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
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
              onClick={handleSendMessage} 
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
          {!parentApiKey && (
            <p className="text-xs text-muted-foreground mt-2">
              Note: For the best experience, ask your parent to add their OpenAI API key in parent settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
