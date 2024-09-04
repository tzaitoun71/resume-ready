import { NextResponse } from "next/server";
import clientPromise from "../../MongoDB";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

interface Application {
  id: string;
  companyName: string;
  position: string;
  location: string;
  jobDescription: string;
  resumeFeedback: string;
  coverLetter: string;
  interviewQuestions: any[];
  status: string;
  dateCreated: Date | null;
}

interface InterviewQuestion {
  type: string;
  question: string;
  answer: string;
}

interface JsonResponse {
  companyName: string;
  position: string;
  location: string;
  jobDescription: string;
  resumeFeedback: string;
}

export async function POST(req: Request) {
  try {
    const { userId, jobDescription, questionType, numQuestions = 3, jobId } = await req.json();

    if (!userId || !jobDescription || !jobId) {
      return NextResponse.json(
        { error: "User ID, Job ID, and job description are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("resume-ready");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ userId });

    if (!user || !user.resume) {
      return NextResponse.json(
        { error: "User resume not found." },
        { status: 404 }
      );
    }

    const userResume = user.resume;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const interviewPrompt = `
    You are an expert in interview preparation. Given the job description and the user's resume, generate ${numQuestions} ${questionType} interview questions that could be asked for this position. Include both the question and a detailed model answer that demonstrates how to effectively answer each question.

    Ensure that the response only includes questions of the following types:
    - Technical: Questions that assess the candidate's technical skills and problem-solving abilities related to the job description.
    - Behavioral: Questions that evaluate the candidate's past behavior and experiences to predict future performance in a work environment.
    
    Format all outputs strictly in the following JSON format:

    {
      "interviewQuestions": [
        {
          "type": "Behavioral",
          "question": "What is your greatest strength?",
          "answer": "My greatest strength is my ability to solve problems efficiently. In my previous role, I improved system efficiency by 15% through innovative solutions."
        },
        {
          "type": "Technical",
          "question": "How do you handle debugging in JavaScript?",
          "answer": "I use console logging, breakpoints, and debugging tools in Chrome Developer Tools to trace errors and understand their causes."
        }
      ]
    }

    Ensure that the response is valid JSON with no additional commentary, and include both the question type and answer in each question object.

    **Resume**:
    ${userResume}

    **Job Description**:
    ${jobDescription}

    **JSON Response (plain text only)**:
    `;

    const InterviewResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: interviewPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const rawInterviewContent = InterviewResponse.choices[0].message?.content?.trim();

    if (!rawInterviewContent) {
      console.error("No content received from OpenAI.");
      return NextResponse.json(
        { error: "No questions generated." },
        { status: 500 }
      );
    }

    let sanitizedInterviewContent = rawInterviewContent.replace(/```json|```/g, "").trim();
    const interviewJsonMatch = sanitizedInterviewContent.match(/{[^]*}/);

    if (!interviewJsonMatch) {
      console.error("Failed to find valid JSON in OpenAI response.");
      return NextResponse.json(
        { error: "Failed to parse JSON from OpenAI response" },
        { status: 500 }
      );
    }

    let interviewJsonResponse;
    try {
      interviewJsonResponse = JSON.parse(interviewJsonMatch[0]);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json(
        { error: "Failed to parse JSON from OpenAI response" },
        { status: 500 }
      );
    }

    const interviewQuestions: InterviewQuestion[] = interviewJsonResponse.interviewQuestions || [];

    await usersCollection.updateOne(
      { userId, "applications.id": jobId },
      {
        $push: { "applications.$.interviewQuestions": { $each: interviewQuestions } as any}
      }
    );

    console.log("Questions appended successfully to MongoDB.");

    return NextResponse.json(
      { newQuestions: interviewQuestions },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
