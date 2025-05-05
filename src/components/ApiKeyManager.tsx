
import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useResumeContext } from '@/contexts/ResumeContext';
import { useToast } from '@/hooks/use-toast';

const ApiKeyManager: React.FC = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const { openRouterApiKey, setOpenRouterApiKey, apiError } = useResumeContext();
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved API key in localStorage or use the provided one
    const savedApiKey = localStorage.getItem('openRouterApiKey') || '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';
    if (savedApiKey) {
      setOpenRouterApiKey(savedApiKey);
    } else {
      // If no API key is found, prompt the user to set one
      setIsApiKeyModalOpen(true);
    }
  }, [setOpenRouterApiKey]);

  // If there's an insufficient credit error, show the API key manager
  useEffect(() => {
    if (apiError && apiError.includes("Insufficient Credit")) {
      setIsApiKeyModalOpen(true);
    }
  }, [apiError]);

  const handleApiKeySave = (apiKey: string) => {
    setOpenRouterApiKey(apiKey);
    localStorage.setItem('openRouterApiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved successfully.",
    });
    setIsApiKeyModalOpen(false);
  };

  if (openRouterApiKey && !apiError?.includes("Insufficient Credit")) {
    return null; // Don't render anything if API key is set and no credit error
  }

  const showCreditError = apiError?.includes("Insufficient Credit");

  return (
    <>
      <div className={`mt-8 p-4 border rounded-lg ${showCreditError ? 'bg-red-50' : 'bg-amber-50'} flex items-center gap-3`}>
        <AlertTriangle className={`h-5 w-5 ${showCreditError ? 'text-red-500' : 'text-amber-500'} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm ${showCreditError ? 'text-red-800' : 'text-amber-800'}`}>
            {showCreditError 
              ? "Your OpenRouter API key has insufficient credits. Please add credits to your account or use a different API key." 
              : "You need to set your OpenRouter API key to generate AI roasts. Your key is stored only in your browser."}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsApiKeyModalOpen(true)}
          className="whitespace-nowrap"
        >
          <Key className="h-4 w-4 mr-2" />
          {showCreditError ? "Update API Key" : "Set API Key"}
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
