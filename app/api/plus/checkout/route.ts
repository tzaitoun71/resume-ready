import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'ResumeReady Plus Membership',
            },
            unit_amount: 999, // Price in cents ($9.99)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/api/plus/success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}`, // Updated path
      cancel_url: `${req.nextUrl.origin}/dashboard`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    return new NextResponse(err.message, { status: err.statusCode || 500 });
  }
}
