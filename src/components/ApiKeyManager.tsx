
import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useResumeContext } from '@/contexts/ResumeContext';
import { useToast } from '@/hooks/use-toast';

const ApiKeyManager: React.FC = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const { deepseekApiKey, setDeepseekApiKey, apiError } = useResumeContext();
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved API key in localStorage or use the provided one
    const savedApiKey = localStorage.getItem('deepseekApiKey') || 'sk-15b0f13de64343b893f45d6e02809283';
    if (savedApiKey) {
      setDeepseekApiKey(savedApiKey);
    } else {
      // If no API key is found, prompt the user to set one
      setIsApiKeyModalOpen(true);
    }
  }, [setDeepseekApiKey]);

  // If there's an insufficient balance error, show the API key manager
  useEffect(() => {
    if (apiError && apiError.includes("Insufficient Balance")) {
      setIsApiKeyModalOpen(true);
    }
  }, [apiError]);

  const handleApiKeySave = (apiKey: string) => {
    setDeepseekApiKey(apiKey);
    localStorage.setItem('deepseekApiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your DeepSeek API key has been saved successfully.",
    });
    setIsApiKeyModalOpen(false);
  };

  if (deepseekApiKey && !apiError?.includes("Insufficient Balance")) {
    return null; // Don't render anything if API key is set and no balance error
  }

  const showBalanceError = apiError?.includes("Insufficient Balance");

  return (
    <>
      <div className={`mt-8 p-4 border rounded-lg ${showBalanceError ? 'bg-red-50' : 'bg-amber-50'} flex items-center gap-3`}>
        <AlertTriangle className={`h-5 w-5 ${showBalanceError ? 'text-red-500' : 'text-amber-500'} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm ${showBalanceError ? 'text-red-800' : 'text-amber-800'}`}>
            {showBalanceError 
              ? "Your DeepSeek API key has insufficient balance. Please add credits to your account or use a different API key." 
              : "You need to set your DeepSeek API key to generate AI roasts. Your key is stored only in your browser."}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsApiKeyModalOpen(true)}
          className="whitespace-nowrap"
        >
          <Key className="h-4 w-4 mr-2" />
          {showBalanceError ? "Update API Key" : "Set API Key"}
        </Button>
      </div>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
      />
    </>
  );
};

export default ApiKeyManager;
