
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppAccess } from '@/hooks/use-app-access';
import { useTutorChat } from '@/hooks/use-tutor-chat';
import { useParentApiKey } from '@/hooks/use-parent-api-key';
import { TutorChatMessage } from './TutorChatMessage';
import { TutorChatInput } from './TutorChatInput';
import { TutorEmptyState } from './TutorEmptyState';

interface TutorChatProps {
  subject: 'math' | 'language' | 'science';
  ageGroup: string;
}

export function TutorChat({ subject, ageGroup }: TutorChatProps) {
  const { profile } = useAuth();
  const { hasAccess, isLoading: isCheckingAccess } = useAppAccess();
  const { parentApiKey } = useParentApiKey();
  
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    messagesEndRef 
  } = useTutorChat({ 
    subject, 
    ageGroup, 
    parentApiKey 
  });

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
