
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
    // Check for saved API key in localStorage without a hardcoded fallback
    const savedApiKey = localStorage.getItem('openRouterApiKey');
    if (savedApiKey) {
      setOpenRouterApiKey(savedApiKey);
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

  // We now only show the API key manager when there's an error
  // or if the user explicitly wants to set their own API key
  if (!apiError?.includes("Insufficient Credit")) {
    return null;
  }

  const showCreditError = apiError?.includes("Insufficient Credit");

  return (
    <>
      <div className="mt-8 p-4 border rounded-lg bg-red-50 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800">
            {showCreditError 
              ? "The application's OpenRouter API key has insufficient credits. You can contact the site administrator or use your own API key." 
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
          {showCreditError ? "Use My API Key" : "Set API Key"}
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
