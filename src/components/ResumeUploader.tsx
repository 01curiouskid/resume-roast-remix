
import React, { useState, useRef } from 'react';
import { Upload, FilePlus, FileWarning, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractTextFromFile } from '@/lib/resume-parser';
import { useToast } from '@/hooks/use-toast';

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
    
    if (!allowedTypes.includes(file.type)) {
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
      
      // Extract text from the file
      const text = await extractTextFromFile(file);
      
      if (text.trim().length < 50) {
        toast({
          title: "Too Little Content",
          description: "The extracted text is too short to generate a proper roast.",
          variant: "destructive"
        });
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
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`upload-zone ${isDragging ? 'border-primary bg-primary/10' : ''} ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
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
        disabled={isProcessing}
      />
      
      {!file ? (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Upload Your Resume</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            Drag and drop your resume file here, or click to browse.
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {isExtracting ? (
              <FileWarning className="h-8 w-8 text-amber-500 animate-pulse" />
            ) : (
              <FilePlus className="h-8 w-8 text-green-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="font-medium">{file.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isExtracting ? 'Extracting text...' : 'Click to upload a different resume'}
          </p>
        </>
      )}
    </div>
  );
};

export default ResumeUploader;
