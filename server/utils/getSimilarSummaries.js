import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME; // e.g. 'Summary'
const VECTOR_INDEX_NAME = 'vector_index'; // your Atlas vector index name

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getSimilarSummaries(userText) {
  try {
    // Step 1: Embed the user complaint
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userText
    });

    const userVector = embeddingResponse.data[0].embedding;

    // Step 2: Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    // Step 3: Run the vector search query
    const results = await collection.aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: 'vector', // adjust if your field is named differently (e.g., "vector_embedding")
          queryVector: userVector,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          _id: 0,
          zipCode: 1,
          summary: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();

    await client.close();
    console.log("🧪 Raw vector search results:", JSON.stringify(results, null, 2));

    return results;

  } catch (err) {
    console.error('❌ Error in getSimilarSummaries:', err);
    return [];
  }
}
