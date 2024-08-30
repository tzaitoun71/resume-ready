import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import OpenAI from 'openai';
import clientPromise from '../../MongoDB';
import { Readable } from 'stream';

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

    // Parse the PDF using pdfreader
    const pdfReader = new PdfReader();
    let extractedText = '';

    // Convert buffer to a readable stream
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    // Process the readable stream
    pdfReader.parseBuffer(buffer, (err, item) => {
      if (err) {
        console.error("Error parsing PDF:", err);
        return;
      }
      if (!item) {
        console.log("End of PDF file");
      } else if (item.text) {
        extractedText += `${item.text} `;
      }
    });

    // Ensure the text extraction process is completed before continuing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Adding a delay to wait for text extraction to complete

    // Send extracted text to OpenAI to categorize and structure
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that organizes text into a structured and categorized format. Do not add any messages at the begining such as "Here is a structured and categorized format" Just get straight to it.',
        },
        {
          role: 'user',
          content: `Organize and categorize the following text: ${extractedText}`,
        },
      ],
      max_tokens: 2000,
    });

    const organizedText = response.choices?.[0]?.message?.content || '';

    // Store the organized text in MongoDB
    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { userId }, // Use the fetched userId here
      { $set: { resume: organizedText } }
    );

    return NextResponse.json({ message: 'PDF processed and saved successfully', organizedText }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing PDF:', error.message);
    return NextResponse.json({ error: error.message || 'Error processing PDF' }, { status: 500 });
  }
}
