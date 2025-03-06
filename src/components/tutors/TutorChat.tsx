
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppAccess } from '@/hooks/use-app-access';
import { useTutorChat } from '@/hooks/use-tutor-chat';
import { useParentApiKey } from '@/hooks/use-parent-api-key';
import { TutorChatMessage } from './TutorChatMessage';
import { TutorChatInput } from './TutorChatInput';
import { TutorEmptyState } from './TutorEmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TutorChatProps {
  subject: 'math' | 'language' | 'science';
  ageGroup: string;
}

export function TutorChat({ subject, ageGroup }: TutorChatProps) {
  const { profile } = useAuth();
  const { hasAccess, isLoading: isCheckingAccess } = useAppAccess();
  const { parentApiKey } = useParentApiKey();
  const navigate = useNavigate();
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(!parentApiKey);
  
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    messagesEndRef,
    error
  } = useTutorChat({ 
    subject, 
    ageGroup, 
    parentApiKey 
  });

  const goToParentSettings = () => {
    navigate('/parent-settings');
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
      {showApiKeyAlert && profile?.user_type === 'parent' && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>An OpenAI API key is required for the tutors to work. Please add your API key in the parent settings.</p>
            <Button 
              onClick={goToParentSettings} 
              variant="outline" 
              size="sm" 
              className="self-start mt-2"
            >
              Go to Settings
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col h-[70vh] md:h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <TutorEmptyState subject={subject} />
          ) : (
            messages.map(msg => (
              <TutorChatMessage key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <TutorChatInput
          isProcessing={isProcessing}
          subject={subject}
          onSendMessage={sendMessage}
          showApiKeyWarning={!parentApiKey}
        />
      </div>
    </div>
  );
}
