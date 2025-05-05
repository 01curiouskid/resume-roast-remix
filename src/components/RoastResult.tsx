
import React, { useState } from 'react';
import { Copy, Share2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROAST_LEVELS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface RoastResultProps {
  roastText: string;
  spiciness: string;
  onRegenerateClick: () => void;
  isRegenerating: boolean;
}

const RoastResult: React.FC<RoastResultProps> = ({
  roastText,
  spiciness,
  onRegenerateClick,
  isRegenerating
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(roastText);
      setIsCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "The roast has been copied to your clipboard.",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleShareClick = async () => {
    // In a real app, this would generate a shareable link
    // For now, we'll use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Resume Roast',
          text: roastText,
          url: window.location.href,
        });
        
        toast({
          title: "Shared successfully",
          description: "Your roast has been shared.",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Share failed",
            description: "Could not share the roast.",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyClick();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className={`roast-text ${
          spiciness === ROAST_LEVELS.MILD ? 'border-roast-mild/30' : 
          spiciness === ROAST_LEVELS.SPICY ? 'border-roast-spicy/30' : 
          'border-roast-extra/30'
        }`}>
          <p className="whitespace-pre-line">{roastText}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyClick}
            className="flex-1 sm:flex-none"
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShareClick}
            className="flex-1 sm:flex-none"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRegenerateClick}
            disabled={isRegenerating}
            className="flex-1 sm:flex-none ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoastResult;
