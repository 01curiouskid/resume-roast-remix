
import React from 'react';
import { Separator } from '@/components/ui/separator';
import RoastResult from '@/components/RoastResult';
import { useResumeContext } from '@/contexts/ResumeContext';

const RoastDisplay: React.FC = () => {
  const { roastText, spiciness, isLoading, handleGenerateRoast } = useResumeContext();

  if (!roastText) {
    return null; // Don't render anything if there's no roast
  }

  return (
    <>
      <Separator className="mb-8" />
      <RoastResult 
        roastText={roastText}
        spiciness={spiciness}
        onRegenerateClick={handleGenerateRoast}
        isRegenerating={isLoading}
      />
    </>
  );
};

export default RoastDisplay;
