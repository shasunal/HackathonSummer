import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME; // <- set this in .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getFilteredData(userText, selectedFields) {
  try {
    // Step 1: Embed user complaint
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userText
    });

    const userVector = embeddingResponse.data[0].embedding;

    // Step 2: Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Step 3: Build Atlas Vector Search query
    const query = {
      index: "vector_index", // <- change to your Atlas index name
      knnBeta: {
        vector: userVector,
        path: "vector_embedding",
        k: 10
      }
    };

    // Optionally: add filters (not required yet, but here's how you would)
    // Example: if (selectedFields.includes("zip_code")) { ... }

    // Step 4: Run the query
    const results = await collection.aggregate([
      { $search: query },
      { $project: { _id: 0, vector_embedding: 0 } }, // hide vector
      { $limit: 10 }
    ]).toArray();

    await client.close();
    return results;

  } catch (err) {
    console.error("Error in getFilteredData:", err);
    return [];
  }
}
