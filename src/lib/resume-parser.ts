
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
    // For simplicity in this version, we'll use a mock implementation
    // In a real app, you would use a PDF parsing library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified mock. In reality, you'd use a PDF parsing library
        // to properly extract the text content
        resolve(`[PDF Content extracted from ${file.name}]`);
      };
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please try another file.');
  }
}

async function extractFromDOCX(file: File): Promise<string> {
  try {
    // For simplicity in this version, we'll use a mock implementation
    // In a real app, you would use a DOCX parsing library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified mock. In reality, you'd use a DOCX parsing library
        resolve(`[DOCX Content extracted from ${file.name}]`);
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
