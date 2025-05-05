
import React from 'react';
import { Separator } from '@/components/ui/separator';
import RoastResult from '@/components/RoastResult';
import { useResumeContext } from '@/contexts/ResumeContext';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const RoastDisplay: React.FC = () => {
  const { 
    roastText, 
    spiciness, 
    isLoading, 
    handleGenerateRoast, 
    apiError 
  } = useResumeContext();

  // Don't render anything if no roast and no error
  if (!roastText && !apiError) {
    return null;
  }

  return (
    <>
      <Separator className="mb-8" />
      
      {apiError ? (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>
            {apiError.includes("Insufficient Balance") ? (
              <div className="space-y-2">
                <p>Your DeepSeek API key has insufficient balance. Please add credits to your account or use a different API key.</p>
                <p className="text-sm">Error details: {apiError}</p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open("https://platform.deepseek.com", "_blank")}
                  >
                    Visit DeepSeek Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              apiError
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <RoastResult 
          roastText={roastText}
          spiciness={spiciness}
          onRegenerateClick={handleGenerateRoast}
          isRegenerating={isLoading}
        />
      )}
    </>
  );
};

export default RoastDisplay;
