
import React from 'react';
import { Flame } from 'lucide-react';

const Header: React.FC = () => {
  return (
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
  );
};

export default Header;
