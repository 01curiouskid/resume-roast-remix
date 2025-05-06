
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
            {apiError.includes("Insufficient Credit") ? (
              <div className="space-y-2">
                <p>The application's OpenRouter API key has insufficient credit. Please try again later or use your own API key.</p>
                <p className="text-sm">Error details: {apiError}</p>
              </div>
            ) : apiError.includes("json") ? (
              <div className="space-y-2">
                <p>There was a problem with the API response. Please try again or try a different spiciness level.</p>
                <p className="text-sm">Error details: {apiError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateRoast}
                  className="mt-2"
                >
                  Try Again
                </Button>
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
