import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import OpenAI from 'openai';
import clientPromise from '../../MongoDB';

// Initialize OpenAI with API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the API key is correctly set in your environment variables
});

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    const userId = data.get('userId');

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

    if (!organizedText) {
      console.error("Failed to receive organized text from OpenAI.");
      return NextResponse.json({ error: 'Failed to organize text' }, { status: 500 });
    }

    // Store the organized text in MongoDB
    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { userId },
      { $set: { resume: organizedText } }
    );

    console.log("Resume updated successfully in MongoDB.");

    return NextResponse.json({ message: 'PDF processed and saved successfully', organizedText }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing PDF:', error.message);
    return NextResponse.json({ error: error.message || 'Error processing PDF' }, { status: 500 });
  }
}
