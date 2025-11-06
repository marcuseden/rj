import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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
    const fileName = file.name;
    let text = '';

    console.log(`Processing file: ${fileName}, type: ${fileType}`);

    // Handle text files
    if (fileType === 'text/plain') {
      text = await file.text();
    }
    // Handle PDF files
    else if (fileType === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`PDF buffer size: ${buffer.length} bytes`);
        
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        
        console.log(`Extracted ${text.length} characters from PDF`);
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: `Failed to parse PDF: ${pdfError.message}` },
          { status: 500 }
        );
      }
    }
    // Handle Word documents (.docx)
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`DOCX buffer size: ${buffer.length} bytes`);
        
        const result = await mammoth.extractRawText({ buffer: buffer });
        text = result.value;
        
        console.log(`Extracted ${text.length} characters from DOCX`);
      } catch (docxError: any) {
        console.error('DOCX parsing error:', docxError);
        return NextResponse.json(
          { error: `Failed to parse Word document: ${docxError.message}` },
          { status: 500 }
        );
      }
    }
    // Handle old Word documents (.doc)
    else if (fileType === 'application/msword') {
      return NextResponse.json(
        { error: 'Please convert .doc files to .docx format for better text extraction' },
        { status: 400 }
      );
    }
    else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT files.` },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    text = text.trim();

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file. The file might be empty or corrupted.' },
        { status: 400 }
      );
    }

    console.log(`Successfully extracted ${text.length} characters`);
    
    return NextResponse.json({ 
      text,
      metadata: {
        fileName,
        fileType,
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(w => w).length
      }
    });

  } catch (error: any) {
    console.error('Error extracting text:', error);
    return NextResponse.json(
      { error: `Failed to extract text from file: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}


