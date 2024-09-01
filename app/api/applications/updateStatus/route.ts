// app/api/applications/updateStatus/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; // Ensure the path to your MongoDB utility is correct

export async function POST(req: Request) {
  try {
    const { userId, applicationId, newStatus } = await req.json();

    if (!userId || !applicationId || !newStatus) {
      return NextResponse.json({ error: 'User ID, Application ID, and new status are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('resume-ready');
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { userId, 'applications.id': applicationId },
      { $set: { 'applications.$.status': newStatus } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Application not found or status already set.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
