
import React from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import SpicySelector from '@/components/SpicySelector';
import { Button } from '@/components/ui/button';
import { SquareTerminal } from 'lucide-react';
import { useResumeContext } from '@/contexts/ResumeContext';

const ResumeInput: React.FC = () => {
  const { 
    resumeText, 
    setResumeText, 
    spiciness, 
    isLoading,
    handleResumeTextExtracted,
    handleSpicinessChange,
    handleGenerateRoast
  } = useResumeContext();

  return (
    <>
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
    </>
  );
};

export default ResumeInput;
