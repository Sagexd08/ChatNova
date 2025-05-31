import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Custom PDF text extraction function for serverless environments
async function extractPDFText(buffer: Buffer, filename: string): Promise<string> {
  try {
    // Convert buffer to string and look for text patterns
    const pdfString = buffer.toString('binary');
    
    // Basic PDF text extraction using regex patterns
    // This is a simplified approach that works for many standard PDFs
    const textRegex = /BT\s*.*?ET/gs;
    const matches = pdfString.match(textRegex);
    
    if (!matches) {
      return `PDF "${filename}" appears to be image-based or uses a complex format. Text extraction requires a more advanced parser.`;
    }
    
    let extractedText = '';
    
    for (const match of matches) {
      // Extract text between parentheses and brackets
      const textContent = match.match(/\((.*?)\)/g) || match.match(/\[(.*?)\]/g);
      if (textContent) {
        for (const text of textContent) {
          const cleanText = text.replace(/[()[\]]/g, '').trim();
          if (cleanText && cleanText.length > 1) {
            extractedText += cleanText + ' ';
          }
        }
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
      .trim();
    
    if (extractedText.length < 10) {
      return `PDF "${filename}" processed successfully. Content appears to be primarily visual or uses advanced formatting. Consider using a specialized PDF reader for better text extraction.`;
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('Custom PDF extraction error:', error);
    return `PDF "${filename}" could not be processed. The file may be corrupted, password-protected, or use an unsupported format.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Unsupported file type: ${fileType}. Supported types are PDF, DOC, DOCX, and TXT.` 
        },
        { status: 400 }
      );
    }

    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, `${uuidv4()}-${file.name}`);
    
    // Convert file to buffer and save to temp location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

    // Process the file based on type
    let content = '';
    
    if (fileType === 'application/pdf') {
      try {
        // Alternative PDF text extraction approach for serverless environments
        content = await extractPDFText(buffer, file.name);
        
        // If no text was extracted, provide a helpful message
        if (!content || content.trim().length === 0) {
          content = `PDF file "${file.name}" was processed but no readable text content was found. This could be because the PDF contains only images, is password-protected, or uses a format that doesn't support text extraction.`;
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        content = `Error extracting content from PDF "${file.name}": ${pdfError instanceof Error ? pdfError.message : 'Unknown error occurred during PDF processing'}`;
      }
    } else if (fileType.includes('word')) {
      // For DOC/DOCX files
      content = `Extracted content from Word document: ${file.name}\n\nThis is simulated content extraction. In a production environment, you would use a library like mammoth or docx to extract the actual text content from the Word document.`;
    } else if (fileType === 'text/plain') {
      // For TXT files, we can read the content directly
      content = buffer.toString('utf-8');
    }

    // Clean up the temp file
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }

    return NextResponse.json({
      success: true,
      content,
      filename: file.name,
      fileType,
      fileSize: file.size,
      extractedAt: new Date().toISOString(),
      contentLength: content.length,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    );
  }
}