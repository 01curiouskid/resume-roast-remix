
import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, SquareTerminal, Key, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import ResumeUploader from '@/components/ResumeUploader';
import SpicySelector from '@/components/SpicySelector';
import RoastResult from '@/components/RoastResult';
import ApiKeyModal from '@/components/ApiKeyModal';

import { generateRoast } from '@/lib/api-service';
import { ROAST_LEVELS } from '@/lib/constants';

const Index = () => {
  const [resumeText, setResumeText] = useState<string>('');
  const [spiciness, setSpiciness] = useState<string>(ROAST_LEVELS.MILD);
  const [roastText, setRoastText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>('');
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
  }, []);

  const handleResumeTextExtracted = (text: string) => {
    setResumeText(text);
    setRoastText(''); // Clear any existing roast
  };

  const handleSpicinessChange = (value: string) => {
    setSpiciness(value);
    // If there's already a roast, clear it when changing spiciness
    if (roastText) {
      setRoastText('');
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    setDeepseekApiKey(apiKey);
    localStorage.setItem('deepseekApiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your DeepSeek API key has been saved successfully.",
    });
    setIsApiKeyModalOpen(false);
  };

  const handleGenerateRoast = async () => {
    if (!resumeText) {
      toast({
        title: "No Resume",
        description: "Please upload a resume first.",
        variant: "destructive"
      });
      return;
    }

    if (!deepseekApiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      // We're passing the API key through a module scope variable
      // This is not ideal, but keeps the demo simpler
      (window as any).DEEPSEEK_API_KEY = deepseekApiKey;
      
      const result = await generateRoast(resumeText, spiciness as any);
      setRoastText(result);
    } catch (error) {
      console.error('Error generating roast:', error);
      let errorMessage = 'Failed to generate roast. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Roast Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <header className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Resume Roaster</h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Upload your resume and watch as AI roasts it to crispy perfection. 
            Adjust the spiciness to control the heat.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <ResumeUploader 
                onTextExtracted={handleResumeTextExtracted} 
                isProcessing={isLoading}
              />
            </div>
            <div>
              <SpicySelector 
                spiciness={spiciness} 
                onChange={handleSpicinessChange}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <Button 
              size="lg" 
              className="px-8"
              onClick={handleGenerateRoast}
              disabled={!resumeText || isLoading}
            >
              {isLoading ? 'Generating Roast...' : 'Roast My Resume'}
            </Button>
          </div>

          {roastText && (
            <>
              <Separator className="mb-8" />
              <RoastResult 
                roastText={roastText}
                spiciness={spiciness}
                onRegenerateClick={handleGenerateRoast}
                isRegenerating={isLoading}
              />
            </>
          )}

          {!deepseekApiKey && (
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
          )}

          {/* For demo purposes, add a textarea to paste resume text directly */}
          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-muted-foreground flex items-center">
              <SquareTerminal className="h-4 w-4 mr-1" />
              Having trouble uploading? Paste text instead
            </summary>
            <div className="mt-3">
              <textarea 
                className="w-full min-h-[200px] p-4 border rounded-md" 
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isLoading}
              ></textarea>
            </div>
          </details>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>Resume Roaster is for entertainment purposes only.</p>
          <p className="mt-1">© 2025 Resume Roaster. All roasts reserved.</p>
        </div>
      </footer>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
};

export default Index;
