import { NextRequest, NextResponse } from 'next/server';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'; // Import PDFLoader from LangChain
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import clientPromise from '../../MongoDB'; // Import your MongoDB client setup

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your OpenAI API key is set in environment variables
});

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string; // Get userId from form data

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Convert file to ArrayBuffer to handle it in memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if we are in a serverless environment and use the appropriate directory
    const tempDir = fs.existsSync('/tmp') ? '/tmp' : path.join(process.cwd(), 'temp');

    // Create the temp directory if it doesn't exist (only needed locally)
    if (tempDir !== '/tmp' && !fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Define a temporary path to save the PDF
    const sanitizedFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase(); // Sanitize file name
    const tempFilePath = path.join(tempDir, `${userId}_${sanitizedFileName}`);
    fs.writeFileSync(tempFilePath, buffer); // Write the buffer directly to a file

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

    // Send extracted text to OpenAI to categorize and structure
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that organizes the following text into a structured format similar to a resume layout. Use commas to separate items where appropriate, and list information in a clear, concise manner with each point or category distinctly separated. Maintain the original order of the text without adding introductory messages or additional instructions.',
        },
        {
          role: 'user',
          content: `Organize and categorize the following text: ${extractedText}`,
        },
      ],
      max_tokens: 2000,
    });

    const organizedText = openaiResponse.choices?.[0]?.message?.content || '';
    console.log("Organized Text from OpenAI:", organizedText);

    if (!organizedText) {
      console.error("Failed to receive organized text from OpenAI.");
      return NextResponse.json({ error: 'Failed to organize text' }, { status: 500 });
    }

    // Connect to MongoDB and prepare for update
    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    console.log("Attempting to update MongoDB with userId:", userId);

    // Use a query to check if user exists before updating
    const existingUser = await usersCollection.findOne({ userId });
    if (!existingUser) {
      console.error("User not found in MongoDB with userId:", userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user's resume in MongoDB
    const updateResult = await usersCollection.updateOne(
      { userId },
      { $set: { resume: organizedText } }
    );

    if (updateResult.matchedCount === 0) {
      console.error("No user document matched the query for userId:", userId);
      return NextResponse.json({ error: 'Failed to update resume, user not found' }, { status: 404 });
    }

    if (updateResult.modifiedCount === 0) {
      console.warn("User document found but resume not updated for userId:", userId);
      return NextResponse.json({ error: 'Resume was not updated' }, { status: 500 });
    }

    console.log("Resume updated successfully in MongoDB for userId:", userId);

    return NextResponse.json({ message: 'PDF processed and saved successfully', organizedText }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing PDF:', error.message);
    return NextResponse.json({ error: error.message || 'Error processing PDF' }, { status: 500 });
  }
}
