import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getFilteredData } from '../utils/getFilteredData.js';

dotenv.config();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optional manual fallback map
const fallbackZipMap = {
  "manhattan": "10025",
  "brooklyn": "11201",
  "queens": "11373",
  "bronx": "10453",
  "harlem": "10027",
  "staten island": "10301"
};

router.post('/complaintSubmit', async (req, res) => {
  try {
    const { complaint } = req.body;
    if (!complaint) return res.status(400).json({ message: 'Missing complaint text' });

    // 🧠 Step 1: GPT to extract context and zip
    const checkPrompt = `
      A user submitted this: "${complaint}"

      You are a public safety assistant.

      Your task is to:
      1. Check if the user has included:
        - A location (zip code, neighborhood, or borough)
        - A time of day (e.g. morning, night)
        - User context (gender and/or age)

      2. If any are missing, return:
      {
        "status": "missing",
        "missing": ["what's missing"]
      }

      3. If complete, also:
        - Extract a zip code from the text if it's mentioned.
        - If not explicitly mentioned, infer a representative zip code for the neighborhood or borough (e.g., use 10025 for "Manhattan", 11201 for "Brooklyn").
        - Select 3–5 relevant fields from this schema for data lookup.

      Schema:
      - zip_code
      - precincts_in_zip
      - dominant_precinct
      - violent_crime_count
      - violent_crimes_by_victim_gender
      - crime_rate_by_tour
      - avg_police_response_time
      - average_street_visibility
      - last_updated

      Respond with this JSON:
      {
        "status": "complete",
        "zip_code": "xxxxx",
        "selected_fields": ["field1", "field2", ...]
      }
    `;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a structured and helpful assistant." },
        { role: "user", content: checkPrompt }
      ]
    });

    const parsed = JSON.parse(gptResponse.choices[0].message.content.trim());

    if (parsed.status === "missing") {
      return res.status(200).json(parsed);
    }

    const selectedFields = parsed.selected_fields;
    let zipCode = parsed.zip_code || null;

    // Optional fallback zip matching
    if (!zipCode) {
      const lower = complaint.toLowerCase();
      for (const key in fallbackZipMap) {
        if (lower.includes(key)) {
          zipCode = fallbackZipMap[key];
          break;
        }
      }
    }

    if (!zipCode) {
      return res.status(400).json({ message: "Could not determine zip code from complaint." });
    }

    // 📦 Step 2: Filter MongoDB data using zip and selected fields
    const filteredData = await getFilteredData(zipCode, selectedFields);

    if (!filteredData || filteredData.length === 0) {
      return res.status(404).json({ message: "No relevant data found for this zip code." });
    }

    // 📢 Step 3: GPT summary from filtered data
    const summaryPrompt = `
      The user submitted this safety concern: "${complaint}"

      You have access to filtered NYC public safety data:
      ${JSON.stringify(filteredData, null, 2)}

      Give a **brief and clear summary** of whether it is safe for this person to travel there.
      Consider crime levels, time of day, and user context (gender/age).
      Avoid excessive detail. Maximum 7 sentences.
    `;

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You summarize filtered NYC safety data." },
        { role: "user", content: summaryPrompt }
      ]
    });

    const finalSummary = summaryResponse.choices[0].message.content.trim();

    return res.status(200).json({
      status: "complete",
      summary: finalSummary,
      rawData: filteredData,
      zipcode: zipCode
    });

  } catch (err) {
    console.error('Error in /complaintSubmit:', err);
    res.status(500).json({ message: 'Server error during complaint processing.' });
  }
});

export default router;
