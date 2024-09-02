import { NextRequest, NextResponse } from "next/server";
import cheerio from "cheerio";

// List of User-Agents for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
];

// Function to scrape text from a given URL and return it as a single string
const scrapeTextFromWeb = async (url: string, logs: string[]): Promise<string> => {
  try {
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Fetch the HTML content of the page using a proxy server and a random user-agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUserAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const textContent = $("body").text().trim().replace(/\s+/g, ' ');
    logs.push(`Extracted text content from URL: ${url}`);

    return textContent;
  } catch (error: any) {
    logs.push(`Error scraping text from web: ${error.message}`);
    throw new Error(`Error in scrapeTextFromWeb: ${error.message}`);
  }
};

// POST handler to scrape text and analyze it
export const POST = async (req: NextRequest) => {
  let logs: string[] = [];
  try {
    logs.push("Received request to scrape text from URL");

    const { url, userId } = await req.json();

    if (!url || !userId) {
      logs.push("URL or User ID not provided");
      return NextResponse.json(
        { error: "URL and User ID are required", logs },
        { status: 400 }
      );
    }

    const jobDescription = await scrapeTextFromWeb(url, logs);
    logs.push("Text scraping completed");

    const analyzeResponse = await fetch(`${req.nextUrl.origin}/api/resume/analyzeText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, jobDescription }),
    });

    const analyzeResult = await analyzeResponse.json();

    if (!analyzeResponse.ok) {
      logs.push(`Error analyzing text: ${analyzeResult.error}`);
      return NextResponse.json(
        { error: analyzeResult.error || 'Failed to analyze text', logs },
        { status: analyzeResponse.status }
      );
    }

    logs.push("Text analysis completed successfully");

    return NextResponse.json({
      message: "Text successfully scraped and analyzed",
      analysis: analyzeResult,
      logs,
    });
  } catch (error: any) {
    logs.push(`Error processing URL: ${error.message}`);
    console.error("Error processing URL in POST handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error", logs },
      { status: 500 }
    );
  }
};

// OPTIONS handler for preflight requests
export const OPTIONS = async () => {
  return NextResponse.json({}, { status: 200 });
};
