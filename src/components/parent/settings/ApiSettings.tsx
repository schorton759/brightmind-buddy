
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ApiSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [openAIKey, setOpenAIKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile?.id) {
      fetchOpenAIKey();
    }
  }, [profile]);

  const fetchOpenAIKey = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_settings')
        .select('openai_key')
        .eq('parent_id', profile?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setOpenAIKey(data.openai_key || '');
        setKeySaved(!!data.openai_key);
      }
    } catch (error) {
      console.error('Error fetching OpenAI key:', error);
    }
  };

  const validateApiKey = (key: string) => {
    // Basic validation for OpenAI API key format
    if (!key) {
      return "API key is required";
    }
    
    if (!key.startsWith('sk-')) {
      return "API key should start with 'sk-'";
    }
    
    if (key.length < 20) {
      return "API key appears to be too short";
    }
    
    return null;
  };

  const handleSaveAPIKey = async () => {
    // Validate the API key
    const validationError = validateApiKey(openAIKey);
    if (validationError) {
      setKeyError(validationError);
      toast({
        variant: "destructive",
        title: "Invalid API Key",
        description: validationError
      });
      return;
    }
    
    setKeyError(null);
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('parent_settings')
        .upsert({ 
          parent_id: profile?.id,
          openai_key: openAIKey
        });
        
      if (error) throw error;
      
      setKeySaved(true);
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        variant: "destructive",
        title: "Failed to save API key",
        description: "Please try again later."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIKey(e.target.value);
    setKeyError(null); // Clear error when user changes the input
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Configure API keys for enhanced features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key" className="flex items-center">
              OpenAI API Key
              {keySaved && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
            </Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openAIKey}
                onChange={handleKeyChange}
                className={`flex-1 ${keyError ? 'border-red-500' : ''}`}
              />
              <Button 
                onClick={handleSaveAPIKey}
                disabled={isUpdating || !openAIKey}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                    Saving
                  </>
                ) : 'Save'}
              </Button>
            </div>
            
            {keyError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{keyError}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              Used for the tutor feature. Your key will be stored securely.
              Get your key at <a href="https://platform.openai.com/api-keys" className="text-primary hover:underline" target="_blank" rel="noreferrer">platform.openai.com/api-keys</a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;
