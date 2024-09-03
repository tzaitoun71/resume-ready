import { NextResponse } from 'next/server';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../../firebase';
import OpenAI from 'openai';
import clientPromise from '../../../MongoDB';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;  // Extract userId from formData

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Uploaded file must be a File' }, { status: 400 });
    }

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, new Uint8Array(await file.arrayBuffer()));
    const imageUrl = await getDownloadURL(storageRef);

    // Extract text from the image using OpenAI or an OCR tool
    const extractTextResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract the text from the following image and provide it in plain text:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const extractedText = extractTextResponse.choices?.[0]?.message?.content?.trim();

    if (!extractedText) {
      return NextResponse.json({ error: 'Failed to extract text from image.' }, { status: 500 });
    }

    // Print the extracted text to the console
    console.log("Extracted Text from Image:", extractedText);

    // Return the extracted text as a response
    return NextResponse.json({ extractedText });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
