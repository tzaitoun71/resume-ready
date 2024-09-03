// app/api/extract-pdf-text/route.ts
import { NextResponse } from 'next/server';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
      console.error('File upload failed: No file found');
      return NextResponse.json({ error: 'File upload failed: No file found' }, { status: 400 });
    }

    console.log(`File uploaded successfully: ${file.name}`);

    // Directly use the Blob (file) with PDFLoader
    const loader = new PDFLoader(file);
    const documents = await loader.load();
    console.log('PDF loaded successfully');

    // Extract the text from the documents
    const organizedText = documents.map((doc) => doc.pageContent).join('\n');
    console.log('Text extracted from PDF');

    // Send the extracted text back to the client
    return NextResponse.json({ organizedText }, { status: 200 });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}
