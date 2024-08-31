// app/api/users/signup/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; // Correct the import path based on your project structure

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);

    const { userId, email, firstName, lastName } = body;

    // Ensure all fields are provided
    if (!userId || !firstName || !lastName) {
      console.error('Missing fields:', { userId, firstName, lastName });
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Use the connectToDatabase function to get the MongoClient
    const client = await clientPromise;
    const db = client.db('resume-ready'); // Use your actual database name
    const usersCollection = db.collection('users');

    // Insert user data into the 'users' collection with initialized fields
    await usersCollection.insertOne({
      userId, // Use the Firebase UID directly
      email,
      firstName,
      lastName,
      resume: '',
      applications: [
        {
          resumeFeedback: "", // Initialize as an empty string
          coverLetter: "",    // Initialize as an empty string
          interviewQuestions: [], // Initialize as an empty array
        },
      ],
      createdAt: new Date()
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    return NextResponse.json({ error: error.message || 'Error creating user' }, { status: 500 });
  }
}
