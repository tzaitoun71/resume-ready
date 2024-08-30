// app/api/users/[userId]/route.ts (Next.js 13+)

import { NextResponse } from 'next/server';
import clientPromise from '../../../MongoDB'; 

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('resume-ready'); // Adjust the database name as needed
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
