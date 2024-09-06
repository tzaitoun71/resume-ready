import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebase"; // Adjust the path based on your folder structure

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is correctly set in the environment
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and User ID are required" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Uploaded file must be a File" },
        { status: 400 }
      );
    }

    // Convert the file directly to a buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, buffer);

    // Fetch the image URL from Firebase
    const imageUrlPromise = getDownloadURL(storageRef);

    // Set up the OpenAI API call in parallel
    const imageUrl = await imageUrlPromise;

    // Use OpenAI's API to analyze text from the uploaded image
    const extractTextResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use the specific model you're interested in
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract and analyze the text from the following image:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl, // URL of the uploaded image
              },
            },
          ],
        },
      ],
      max_tokens: 300, // Set the token limit based on your requirements
    });

    const extractedText =
      extractTextResponse.choices?.[0]?.message?.content?.trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Failed to extract text from image." },
        { status: 500 }
      );
    }

    console.log("Extracted Text from Image:", extractedText);

    // Return the extracted text as a response
    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 