// app/api/applications/delete/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; // Ensure the path to MongoDB utility is correct

export async function POST(req: Request) {
  try {
    const { userId, applicationId } = await req.json();

    if (!userId || !applicationId) {
      return NextResponse.json({ error: 'User ID and Application ID are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    // Correct use of $pull with proper typing
    const result = await usersCollection.updateOne(
      { userId },
      { $pull: { applications: { id: applicationId } } as any } // Adding 'as any' to satisfy TypeScript
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Application not found or already deleted.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
