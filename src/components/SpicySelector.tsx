
import React from 'react';
import { Flame } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ROAST_LEVELS } from '@/lib/constants';

interface SpicySelectorProps {
  spiciness: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SpicySelector: React.FC<SpicySelectorProps> = ({ 
  spiciness, 
  onChange,
  disabled = false
}) => {
  const handleChange = (values: number[]) => {
    const value = values[0];
    let level;
    
    if (value <= 33) {
      level = ROAST_LEVELS.MILD;
    } else if (value <= 66) {
      level = ROAST_LEVELS.SPICY;
    } else {
      level = ROAST_LEVELS.EXTRA_SPICY;
    }
    
    onChange(level);
  };

  // Convert string spiciness to slider value
  const getSliderValue = (): number => {
    switch (spiciness) {
      case ROAST_LEVELS.MILD:
        return 16;
      case ROAST_LEVELS.SPICY:
        return 50;
      case ROAST_LEVELS.EXTRA_SPICY:
        return 84;
      default:
        return 16;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${
            spiciness === ROAST_LEVELS.MILD ? 'text-roast-mild' : 
            spiciness === ROAST_LEVELS.SPICY ? 'text-roast-spicy' : 
            'text-roast-extra'
          }`} />
          <h3 className="font-medium">Spiciness Level</h3>
        </div>
        <div className={`text-sm font-semibold rounded-full px-3 py-1 ${
          spiciness === ROAST_LEVELS.MILD ? 'bg-roast-mild/20 text-roast-mild' : 
          spiciness === ROAST_LEVELS.SPICY ? 'bg-roast-spicy/20 text-roast-spicy' : 
          'bg-roast-extra/20 text-roast-extra'
        }`}>
          {spiciness === ROAST_LEVELS.MILD ? 'Mild' : 
           spiciness === ROAST_LEVELS.SPICY ? 'Spicy' : 
           'Extra Spicy'}
        </div>
      </div>
      
      <Slider
        disabled={disabled}
        onValueChange={handleChange}
        value={[getSliderValue()]}
        max={100}
        step={1}
        className="my-4"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Gentle Feedback</span>
        <span>No Filter</span>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        {spiciness === ROAST_LEVELS.MILD ? (
          'Friendly roasting with constructive criticism. Won\'t hurt your feelings.'
        ) : spiciness === ROAST_LEVELS.SPICY ? (
          'More direct and sarcastic feedback. Might sting a little!'
        ) : (
          'Brutal, no-holds-barred roasting. Not for the faint of heart!'
        )}
      </div>
    </div>
  );
};

export default SpicySelector;
