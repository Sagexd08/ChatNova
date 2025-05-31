import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse to avoid build issues
    const pdf = (await import('pdf-parse')).default;

    // Extract text from PDF
    const data = await pdf(buffer);

    // Enhanced text cleaning and formatting
    let cleanedText = data.text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Convert remaining \r to \n
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();

    // Add structure markers for better parsing
    cleanedText = `=== PDF DOCUMENT: ${file.name} ===
Pages: ${data.numpages}
File Size: ${(file.size / 1024 / 1024).toFixed(2)} MB

CONTENT:
${cleanedText}

=== END OF DOCUMENT ===`;

    if (!data.text || data.text.length < 10) {
      return NextResponse.json({
        error: 'Could not extract readable text from PDF. The file might be image-based or corrupted.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      pageCount: data.numpages,
      content: cleanedText,
      metadata: {
        info: data.info,
        metadata: data.metadata
      }
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        return NextResponse.json({ 
          error: 'Invalid PDF file. Please ensure the file is not corrupted.' 
        }, { status: 400 });
      }
      
      if (error.message.includes('Password')) {
        return NextResponse.json({ 
          error: 'Password-protected PDFs are not supported.' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to process PDF. Please try again or use a different file.' 
    }, { status: 500 });
  }
}
