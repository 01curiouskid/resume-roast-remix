
import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useResumeContext } from '@/contexts/ResumeContext';
import { useToast } from '@/hooks/use-toast';

const ApiKeyManager: React.FC = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const { deepseekApiKey, setDeepseekApiKey } = useResumeContext();
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved API key in localStorage
    const savedApiKey = localStorage.getItem('deepseekApiKey');
    if (savedApiKey) {
      setDeepseekApiKey(savedApiKey);
    } else {
      // If no API key is found, prompt the user to set one
      setIsApiKeyModalOpen(true);
    }
  }, [setDeepseekApiKey]);

  const handleApiKeySave = (apiKey: string) => {
    setDeepseekApiKey(apiKey);
    localStorage.setItem('deepseekApiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your DeepSeek API key has been saved successfully.",
    });
    setIsApiKeyModalOpen(false);
  };

  if (deepseekApiKey) {
    return null; // Don't render anything if API key is set
  }

  return (
    <>
      <div className="mt-8 p-4 border rounded-lg bg-amber-50 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            You need to set your DeepSeek API key to generate AI roasts. 
            Your key is stored only in your browser.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsApiKeyModalOpen(true)}
          className="whitespace-nowrap"
        >
          <Key className="h-4 w-4 mr-2" />
          Set API Key
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
