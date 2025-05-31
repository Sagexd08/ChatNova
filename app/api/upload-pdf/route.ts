import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParse from 'pdf-parse';

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
        // Use pdf-parse to extract text from PDF
        const pdfData = await pdfParse(buffer);
        content = pdfData.text;
        
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