
import React, { useState, useRef } from 'react';
import { Upload, FilePlus, FileWarning, Check, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractTextFromFile } from '@/lib/resume-parser';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ResumeUploaderProps {
  onTextExtracted: (text: string) => void;
  isProcessing: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onTextExtracted, 
  isProcessing 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    // Check file type from extension if MIME type is generic
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedByExtension = ['pdf', 'doc', 'docx', 'txt'].includes(fileExtension || '');
    
    if (!allowedTypes.includes(file.type) && !isAllowedByExtension) {
      toast({
        title: "Unsupported File",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setFile(file);
      setIsExtracting(true);
      setExtractionProgress(10); // Start progress

      // Simulate progress while extracting (just for UI feedback)
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : 90;
        });
      }, 500);
      
      // Extract text from the file
      const text = await extractTextFromFile(file);
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      if (text.trim().length < 50) {
        toast({
          title: "Too Little Content",
          description: "The extracted text is too short to generate a proper roast.",
          variant: "destructive"
        });
        // Don't clear the file state so user can see what file had the issue
        return;
      }
      
      onTextExtracted(text);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been processed successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing file:', error);
      let errorMessage = 'Failed to process your resume. Please try another file.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
    }
  };

  const triggerFileInput = () => {
    if (!isExtracting && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div 
      className={`upload-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
      } ${isProcessing || isExtracting ? 'opacity-60' : 'hover:border-primary hover:bg-primary/5'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        disabled={isProcessing || isExtracting}
      />
      
      {!file ? (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Upload Your Resume</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mx-auto mt-2">
            Drag and drop your resume file here, or click to browse.
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </>
      ) : isExtracting ? (
        <>
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold">Extracting Text...</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mx-auto mt-2">
            Analyzing {file.name}
          </p>
          <div className="mt-4 max-w-xs mx-auto">
            <Progress value={extractionProgress} className="h-2" />
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 mx-auto">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Check className="h-4 w-4 text-green-500" />
            <span className="font-medium">{file.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isProcessing ? 'Processing...' : 'Click to upload a different resume'}
          </p>
        </>
      )}
    </div>
  );
};

export default ResumeUploader;
