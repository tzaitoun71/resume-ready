import { NextResponse } from "next/server";
import clientPromise from "../../../MongoDB";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

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
  dateCreated: Date | null;
}

export async function POST(req: Request) {
  try {
    const { userId, jobDescription } = await req.json();

    if (!userId || !jobDescription) {
      return NextResponse.json(
        { error: "User ID and job description are required." },
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

    const prompt = `
  You are an expert in resume analysis and job matching. Given the following resume and job description, provide an in-depth evaluation of how the resume can be refined to better match the job description.

  Your analysis should be detailed and specific, covering the following aspects. Ensure each piece of feedback is separated by the word "POINT" to distinguish different suggestions. Provide at least 8-12 unique and constructive points to thoroughly enhance the resume:
  - Identify specific sections of the resume that align well with the job description and explain why they are effective in detail.
  - Highlight any missing skills, experiences, or qualifications that are crucial for the job. Suggest specific additions that would significantly improve the match with the job description.
  - Point out any irrelevant sections or details in the resume that could detract from the application, and recommend their removal, explaining the impact.
  - Provide thorough suggestions for enhancing particular projects or experiences on the resume. Include advice on how to better detail, expand upon, or clarify these areas to align more closely with the job requirements. For example, if a project could benefit from additional metrics such as user engagement or real-world applications, specify what metrics should be included and why.

  Additionally, provide a concise summary of the job description that captures its main requirements and expectations, including the job location, the key skills required, and what the company is specifically looking for in a candidate. Extract all relevant details such as the company name, position, and location. Format all outputs strictly in the following JSON format, using "POINT" to separate each piece of feedback, without any additional text, labels, backticks, or explanations:

  {
    "companyName": "Company Name Here",
    "position": "Position Here",
    "location": "Location Here",
    "jobDescription": "Concise summary of the job description highlighting the location, key skills required, and specific qualities the company is looking for in a candidate",
    "resumeFeedback": "Describe how your experience in X aligns with the job requirements by detailing specific projects and outcomes, POINT Add metrics to the Y project to highlight its impact, such as the percentage increase in user engagement or cost savings, POINT Remove references to outdated technologies that are not relevant to the job, POINT Improve the description of your role at Z by specifying your leadership skills and any mentorship you provided, etc."
  }

  **Resume**:
  ${userResume}

  **Job Description**:
  ${jobDescription}

  **JSON Response (plain text only)**:
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2500, // Increase token limit for longer responses
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message?.content?.trim();

    if (!rawContent) {
      console.error("No content received from OpenAI.");
      return NextResponse.json(
        { error: "No feedback generated." },
        { status: 500 }
      );
    }

    // Sanitize the AI response to avoid JSON parse errors
    let sanitizedContent = rawContent.replace(/```json|```/g, "").trim();

    // Use regex to try and extract JSON from the response
    const jsonMatch = sanitizedContent.match(/{[^]*}/);

    if (!jsonMatch) {
      console.error("Failed to find valid JSON in OpenAI response.");
      return NextResponse.json(
        { error: "Failed to parse JSON from OpenAI response" },
        { status: 500 }
      );
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonMatch[0]);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json(
        { error: "Failed to parse JSON from OpenAI response" },
        { status: 500 }
      );
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
    await usersCollection.updateOne({ userId }, {
      $push: { applications: application },
    } as any);

    console.log("Application appended successfully to MongoDB.");

    return NextResponse.json(
      { message: "Application appended successfully", application },
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
