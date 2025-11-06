import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileType = file.type;
    let text = '';

    // Handle text files
    if (fileType === 'text/plain') {
      text = await file.text();
    }
    // Handle PDF files
    else if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use pdf-parse library to extract text from PDF
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    }
    // Handle Word documents (.docx)
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use mammoth to extract text from .docx
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    // Handle old Word documents (.doc)
    else if (fileType === 'application/msword') {
      // For .doc files, we'll try to extract text using textract or similar
      // For now, return an error message asking for .docx format
      return NextResponse.json(
        { error: 'Please convert .doc files to .docx format for better text extraction' },
        { status: 400 }
      );
    }
    else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });

  } catch (error) {
    console.error('Error extracting text:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}

