
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'tutor';
  timestamp: Date;
}

interface TutorChatProps {
  subject: 'math' | 'language';
  tutorName: string;
  tutorAvatar: string;
  tutorIntro: string;
}

const TutorChat: React.FC<TutorChatProps> = ({
  subject,
  tutorName,
  tutorAvatar,
  tutorIntro
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [parentApiKey, setParentApiKey] = useState<string | null>(null);
  const [isFetchingKey, setIsFetchingKey] = useState(true);
  
  // Initialize with tutor intro message
  useEffect(() => {
    setMessages([
      {
        id: '0',
        content: tutorIntro,
        sender: 'tutor',
        timestamp: new Date()
      }
    ]);
  }, [tutorIntro]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch parent's API key if needed
  useEffect(() => {
    const fetchParentApiKey = async () => {
      try {
        setIsFetchingKey(true);
        
        // If user is a child, try to find the parent
        if (profile?.user_type === 'child') {
          // First get parent connection
          const { data: connection, error: connectionError } = await supabase
            .from('family_connections')
            .select('parent_id')
            .eq('child_id', profile.id)
            .single();
            
          if (connectionError) {
            if (connectionError.code !== 'PGRST116') {
              console.error('Error fetching parent connection:', connectionError);
            }
            return;
          }
          
          if (connection?.parent_id) {
            // Then get parent's API key
            const { data: settings, error: settingsError } = await supabase
              .from('parent_settings')
              .select('openai_key')
              .eq('parent_id', connection.parent_id)
              .single();
              
            if (settingsError) {
              if (settingsError.code !== 'PGRST116') {
                console.error('Error fetching parent settings:', settingsError);
              }
              return;
            }
            
            if (settings?.openai_key) {
              setParentApiKey(settings.openai_key);
            }
          }
        } 
        // If user is a parent, get their own API key
        else if (profile?.user_type === 'parent') {
          const { data: settings, error: settingsError } = await supabase
            .from('parent_settings')
            .select('openai_key')
            .eq('parent_id', profile.id)
            .single();
            
          if (settingsError) {
            if (settingsError.code !== 'PGRST116') {
              console.error('Error fetching parent settings:', settingsError);
            }
            return;
          }
          
          if (settings?.openai_key) {
            setParentApiKey(settings.openai_key);
          }
        }
      } catch (error) {
        console.error('Error in fetchParentApiKey:', error);
      } finally {
        setIsFetchingKey(false);
      }
    };
    
    if (profile) {
      fetchParentApiKey();
    }
  }, [profile]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      content: currentMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      // Get response from tutor
      const { data, error } = await supabase.functions.invoke('subject-tutor', {
        body: {
          message: currentMessage,
          subject: subject,
          ageGroup: profile?.age_group || '8-10',
          apiKey: parentApiKey // Pass parent's API key if available
        }
      });
      
      if (error) throw error;
      
      // Add tutor response
      const tutorMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'tutor' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, tutorMessage]);
    } catch (error: any) {
      console.error('Error getting tutor response:', error);
      toast({
        variant: "destructive",
        title: "Failed to get response",
        description: error.message || "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] overflow-hidden rounded-lg border border-border bg-card">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.sender === 'tutor' && (
                <div className="flex items-center gap-2 mb-1">
                  <img 
                    src={tutorAvatar} 
                    alt={tutorName} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm">{tutorName}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="text-xs opacity-70 mt-1 text-right">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex items-center gap-2">
                <img 
                  src={tutorAvatar} 
                  alt={tutorName} 
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-semibold text-sm">{tutorName}</span>
              </div>
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-border p-4">
        {!isFetchingKey && !parentApiKey ? (
          <div className="p-3 bg-muted rounded-lg mb-3">
            <p className="text-sm">
              {profile?.user_type === 'parent' ? 
                "Please add your OpenAI API key in Settings to enable the tutor feature." :
                "The tutor feature requires your parent to add an OpenAI API key."
              }
            </p>
          </div>
        ) : null}
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1 resize-none"
            rows={2}
            disabled={isFetchingKey || !parentApiKey}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !currentMessage.trim() || isFetchingKey || !parentApiKey}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TutorChat;
