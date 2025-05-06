
import React from 'react';
import { Separator } from '@/components/ui/separator';
import RoastResult from '@/components/RoastResult';
import { useResumeContext } from '@/contexts/ResumeContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
            ) : apiError.includes("json") || apiError.includes("empty") ? (
              <div className="space-y-2">
                <p>There was a temporary problem with the API response. Please try again or try a different spiciness level.</p>
                <p className="text-sm">Error details: {apiError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateRoast}
                  className="mt-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Trying Again...' : 'Try Again'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p>{apiError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateRoast}
                  className="mt-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Trying Again...' : 'Try Again'}
                </Button>
              </div>
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
