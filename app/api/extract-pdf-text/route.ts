import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Import storage from Firebase configuration
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'; // Import PDFLoader from LangChain
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null; // Correctly cast as File to access 'name' property

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to ArrayBuffer for Firebase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the PDF to Firebase Storage under the 'files' folder
    const storageRef = ref(storage, `files/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, buffer);
    const fileUrl = await getDownloadURL(storageRef);

    console.log('PDF uploaded to Firebase Storage:', fileUrl);

    // Fetch the PDF file from Firebase Storage URL
    const response = await fetch(fileUrl);
    const pdfBuffer = await response.arrayBuffer();

    // Check if we are in a serverless environment and use the appropriate directory
    const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'temp');

    // Create the temp directory if it doesn't exist (only needed locally)
    if (tempDir !== '/tmp' && !fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Define a temporary path to save the PDF
    const tempFilePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    fs.writeFileSync(tempFilePath, Buffer.from(pdfBuffer));

    // Use LangChain's PDFLoader to extract text
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    // Extract text content from the loaded documents
    const extractedText = docs.map(doc => doc.pageContent).join("\n");

    // Clean up the temporary file after processing
    fs.unlinkSync(tempFilePath);

    if (!extractedText) {
      return NextResponse.json({ error: 'Failed to extract text from PDF.' }, { status: 500 });
    }

    return NextResponse.json({ fileUrl, scrapedText: extractedText });
  } catch (error) {
    console.error('Error uploading PDF or extracting text:', error);
    return NextResponse.json({ error: 'Failed to upload PDF or extract text' }, { status: 500 });
  }
}
