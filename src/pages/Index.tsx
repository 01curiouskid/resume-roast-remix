
import React from 'react';
import { ResumeProvider } from '@/contexts/ResumeContext';
import Header from '@/components/Header';
import ResumeInput from '@/components/ResumeInput';
import RoastDisplay from '@/components/RoastDisplay';
import ApiKeyManager from '@/components/ApiKeyManager';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <ResumeProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/50">
        <Header />
        
        <main className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl mx-auto">
            <ResumeInput />
            <RoastDisplay />
            <ApiKeyManager />
          </div>
        </main>

        <Footer />
      </div>
    </ResumeProvider>
  );
};

export default Index;
