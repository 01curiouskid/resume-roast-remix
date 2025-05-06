
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ROAST_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { generateRoast } from '@/lib/api-service';

interface ResumeContextProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  spiciness: string;
  setSpiciness: (level: string) => void;
  roastText: string;
  setRoastText: (text: string) => void;
  isLoading: boolean;
  openRouterApiKey: string;
  setOpenRouterApiKey: (key: string) => void;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  handleResumeTextExtracted: (text: string) => void;
  handleSpicinessChange: (value: string) => void;
  handleGenerateRoast: () => Promise<void>;
}

const ResumeContext = createContext<ResumeContextProps | undefined>(undefined);

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [spiciness, setSpiciness] = useState<string>(ROAST_LEVELS.MILD);
  const [roastText, setRoastText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResumeTextExtracted = (text: string) => {
    setResumeText(text);
    setRoastText(''); // Clear any existing roast
    setApiError(null); // Clear any existing errors
  };

  const handleSpicinessChange = (value: string) => {
    setSpiciness(value);
    // If there's already a roast, clear it when changing spiciness
    if (roastText) {
      setRoastText('');
      setApiError(null); // Clear any existing errors
    }
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

    try {
      setIsLoading(true);
      setApiError(null); // Clear any previous errors
      
      const result = await generateRoast(resumeText, spiciness as any);
      setRoastText(result);
    } catch (error) {
      console.error('Error generating roast:', error);
      let errorMessage = 'Failed to generate roast. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      toast({
        title: "Roast Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    resumeText,
    setResumeText,
    spiciness,
    setSpiciness,
    roastText,
    setRoastText,
    isLoading,
    openRouterApiKey,
    setOpenRouterApiKey,
    apiError,
    setApiError,
    handleResumeTextExtracted,
    handleSpicinessChange,
    handleGenerateRoast
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};
