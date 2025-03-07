
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppAccess } from '@/hooks/use-app-access';
import { useTutorChat } from '@/hooks/use-tutor-chat';
import { useParentApiKey } from '@/hooks/use-parent-api-key';
import { TutorChatMessage } from './TutorChatMessage';
import { TutorChatInput } from './TutorChatInput';
import { TutorEmptyState } from './TutorEmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TutorChatProps {
  subject: 'math' | 'language' | 'science';
  ageGroup: string;
}

export function TutorChat({ subject, ageGroup }: TutorChatProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { hasAccess, isLoading: isCheckingAccess } = useAppAccess();
  const { parentApiKey, isLoading: isLoadingApiKey, refreshApiKey, lastRefreshed } = useParentApiKey();
  const navigate = useNavigate();
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  
  // Use effect to set the API key alert state after loading
  useEffect(() => {
    if (!isLoadingApiKey) {
      setShowApiKeyAlert(!parentApiKey);
    }
  }, [parentApiKey, isLoadingApiKey]);
  
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    messagesEndRef,
    error,
    resetError
  } = useTutorChat({ 
    subject, 
    ageGroup, 
    parentApiKey 
  });

  const goToParentSettings = () => {
    navigate('/parent-settings');
  };

  // Function to check for API key and refresh if needed
  const checkAndRefreshApiKey = () => {
    refreshApiKey();
    
    // Add a toast to confirm the refresh action
    toast({
      title: "Checking API key",
      description: "Refreshing connection to the API key..."
    });
    
    // After a short delay, update the alert state based on the refreshed API key
    setTimeout(() => {
      setShowApiKeyAlert(!parentApiKey);
      
      if (parentApiKey) {
        toast({
          title: "API key found",
          description: "Your API key is ready to use.",
          variant: "default"
        });
      } else {
        toast({
          title: "No API key found",
          description: "Please add an API key in parent settings.",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  // Handle API key errors specifically
  const handleRetryWithApiKey = () => {
    // First refresh the API key
    refreshApiKey();
    
    // Then reset any errors in the chat
    if (resetError) {
      resetError();
    }
    
    toast({
      title: "Retrying connection",
      description: "Reconnecting to the tutor service..."
    });
  };

  if (isCheckingAccess || isLoadingApiKey) {
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
            <div className="flex gap-2 mt-2">
              <Button 
                onClick={goToParentSettings} 
                variant="outline" 
                size="sm"
              >
                Go to Settings
              </Button>
              <Button 
                onClick={checkAndRefreshApiKey} 
                variant="secondary" 
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Check Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            {error.includes('API key') && (
              <div className="flex gap-2 mt-2">
                {profile?.user_type === 'parent' && (
                  <Button 
                    onClick={goToParentSettings} 
                    variant="outline" 
                    size="sm"
                  >
                    Update API Key
                  </Button>
                )}
                <Button 
                  onClick={handleRetryWithApiKey} 
                  variant="secondary" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Connection
                </Button>
              </div>
            )}
          </AlertDescription>
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
          showApiKeyWarning={showApiKeyAlert}
        />
      </div>
    </div>
  );
}
