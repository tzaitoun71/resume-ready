import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; // Adjust the import path as needed

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id');
  const userId = req.nextUrl.searchParams.get('userId');

  // Check if session_id and userId are present
  if (!session_id || !userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    // Update the user's membership status to 'plus' using userId
    const result = await usersCollection.updateOne(
      { userId }, // Search using the userId field
      { $set: { membership: 'plus' } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      throw new Error('Failed to update user membership.');
    }

    // Redirect to dashboard after successful update
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error: any) {
    console.error('Error updating user membership:', error);
    // Redirect to dashboard in case of error
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
