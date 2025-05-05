import * as pdfjsLib from 'pdfjs-dist';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileType) {
    throw new Error('Unknown file type');
  }
  
  if (fileType === 'pdf') {
    return extractFromPDF(file);
  } else if (['doc', 'docx'].includes(fileType)) {
    return extractFromDOCX(file);
  } else if (['txt', 'text'].includes(fileType)) {
    return extractFromTXT(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF, DOCX, or TXT file.`);
  }
}

async function extractFromPDF(file: File): Promise<string> {
  try {
    // Convert the file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please try another file.');
  }
}

async function extractFromDOCX(file: File): Promise<string> {
  // For now, we'll keep the mock implementation since properly parsing DOCX
  // would require more complex libraries and likely a backend service
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In a real app, we would use a DOCX parsing library
        // This is still a mock implementation
        resolve(`[Extracted content from ${file.name}]\n\nThis is a mock implementation for DOCX parsing. For accurate results, please upload a PDF or TXT file.`);
      };
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX. Please try another file.');
  }
}

async function extractFromTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
}
