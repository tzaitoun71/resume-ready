// app/api/extract-pdf-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../firebase';
const cheerio = require('cheerio');

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming FormData
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image to Firebase Storage
    const storageRef = ref(storage, `images/${Date.now()}.png`);
    const snapshot = await uploadBytes(storageRef, buffer);
    const imageUrl = await getDownloadURL(snapshot.ref);

    console.log('Image uploaded to Firebase Storage:', imageUrl);

    // Fetch the HTML page containing the image URL
    const response = await fetch(imageUrl);
    const html = await response.text();

    // Load the HTML into Cheerio for scraping
    const $ = cheerio.load(html);

    // Example: scrape the alt text of the image
    const scrapedText = $('img').attr('alt') || 'No alt text found';

    return NextResponse.json({ imageUrl, scrapedText });
  } catch (error) {
    console.error('Error uploading image or scraping text:', error);
    return NextResponse.json({ error: 'Failed to upload image or scrape text' }, { status: 500 });
  }
}
