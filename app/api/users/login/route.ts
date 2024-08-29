// app/api/users/login/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; // Correct the import path based on your project structure
import { auth } from '../../../firebase'; // Ensure Firebase is correctly set up
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Ensure all fields are provided
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Sign in with Firebase Auth to verify the user credentials
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Connect to MongoDB and fetch user details
    const client = await clientPromise;
    const db = client.db('resume-ready'); // Use your actual database name
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error logging in:', error.message);
    return NextResponse.json({ error: error.message || 'Error logging in' }, { status: 500 });
  }
}
