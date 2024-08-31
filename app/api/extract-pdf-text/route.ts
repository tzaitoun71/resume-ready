import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import OpenAI from 'openai';
import clientPromise from '../../MongoDB';

// Initialize OpenAI with API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    const userId = data.get('userId');
    console.log("UserID: " + userId);

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 });
    }

    // Convert file to ArrayBuffer and then to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Function to parse PDF and extract text as a Promise
    const extractTextFromPDF = (buffer: Buffer): Promise<string> => {
      return new Promise((resolve, reject) => {
        const pdfReader = new PdfReader();
        let extractedText = '';

        pdfReader.parseBuffer(buffer, (err, item) => {
          if (err) {
            console.error("Error parsing PDF:", err);
            reject(err); // Reject if there's an error
          } else if (!item) {
            // End of PDF buffer
            console.log("PDF text extraction completed.");
            resolve(extractedText);
          } else if (item.text) {
            extractedText += `${item.text} `;
          }
        });
      });
    };

    // Wait for the extracted text from PDF
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText) {
      console.error("No text extracted from PDF.");
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
    }

    console.log("Extracted PDF text:", extractedText);

    // Send extracted text to OpenAI to categorize and structure
    const response = await openai.chat.completions.create({
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

    const organizedText = response.choices?.[0]?.message?.content || '';
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
