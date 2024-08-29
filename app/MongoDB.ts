// app/MongoDB.ts
import { MongoClient, MongoClientOptions } from 'mongodb';

const URI: string = process.env.MONGODB_URI || ''; // MongoDB URI from environment variables
const options: MongoClientOptions = {}; // Define any necessary options here

if (!URI) throw new Error('Please add your Mongo URI to .env.local');

let client: MongoClient = new MongoClient(URI, options);
let clientPromise: Promise<MongoClient>;

// Augment the global namespace to include our custom properties
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Check if we are in a development environment
if (process.env.NODE_ENV !== 'production') {
  // In development mode, use a global variable so the client is not repeatedly instantiated
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new MongoClient connection
  clientPromise = client.connect();
}

export default clientPromise;
