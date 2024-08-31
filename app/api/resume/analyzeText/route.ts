import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

interface Application {
  id: string;
  companyName: string;
  position: string;
  location: string;
  jobDescription: string;
  resumeFeedback: string;
  status: string;
  coverLetter: string;
  interviewQuestions: any[];
  dateCreated: Date | null; // Initial date can be null
}

export async function POST(req: Request) {
  try {
    const { userId, jobDescription } = await req.json();

    if (!userId || !jobDescription) {
      return NextResponse.json({ error: 'User ID and job description are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ userId });

    if (!user || !user.resume) {
      return NextResponse.json({ error: 'User resume not found.' }, { status: 404 });
    }

    const userResume = user.resume;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
      You are an expert in resume analysis and job matching. Given the following resume and job description, provide feedback on how the resume could be refined to better match the job description. Also, extract relevant details like company name, position, location, and job description, and format all outputs in the following JSON format. Please format the resume feedback as bullet points separated by commas, without any additional text, backticks, or explanations:

      {
        "companyName": "Company Name Here",
        "position": "Position Here",
        "location": "Location Here",
        "jobDescription": "Job Description Here",
        "resumeFeedback": "Bullet point 1, Bullet point 2, Bullet point 3, etc."
      }

      Resume:
      ${userResume}

      Job Description:
      ${jobDescription}

      JSON Response (plain text only):
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message?.content?.trim();

    if (!rawContent) {
      console.error("No content received from OpenAI.");
      return NextResponse.json({ error: 'No feedback generated.' }, { status: 500 });
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawContent.replace(/```json|```/g, ''));
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json({ error: 'Failed to parse JSON from OpenAI response' }, { status: 500 });
    }

    console.log("Response JSON data:", jsonResponse);

    const application: Application = {
      id: uuidv4(),
      companyName: jsonResponse.companyName,
      position: jsonResponse.position,
      location: jsonResponse.location,
      jobDescription: jsonResponse.jobDescription,
      resumeFeedback: jsonResponse.resumeFeedback,
      status: "Application Submitted",
      coverLetter: "",
      interviewQuestions: [],
      dateCreated: new Date(),
    };

    // Ensure the $push operation is using correct typing
    await usersCollection.updateOne(
      { userId },
      { $push: { applications: application } } as any // Use `as any` to bypass type issues temporarily
    );

    console.log("Application appended successfully to MongoDB.");

    return NextResponse.json({ message: 'Application appended successfully', application }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating feedback:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
