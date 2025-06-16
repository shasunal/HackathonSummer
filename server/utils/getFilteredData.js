// utils/getFilteredData.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

export async function getFilteredData(zipCode, selectedFields) {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Construct projection for selected fields
    const projection = selectedFields.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, { _id: 0 });

    const data = await collection.findOne({ zipCode: zipCode }, { projection });

    await client.close();
    return data ? [data] : [];

  } catch (err) {
    console.error("Error in getFilteredData:", err);
    return [];
  }
}
