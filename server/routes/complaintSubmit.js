import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getFilteredData } from '../utils/getFilteredData.js';
import { getSimilarSummaries } from '../utils/getSimilarSummaries.js';

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
      - zipCode
      - precinct
      - murder
      - rape
      - robbery
      - felony_assault
      - burglary
      - grand_larceny
      - grand_larceny_vehicle
      - total_violent_crime
      - crime_by_tour_0000x0800
      - crime_by_tour_0800x1600
      - crime_by_tour_1600x2400
      - summary

      Only respond with valid JSON in the following format:
      {
        "status": "complete",
        "zip_code": "xxxxx",
        "selected_fields": ["field1", "field2", ...]
      }
      Do not say anything else. Do not explain.
    `;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a structured and helpful assistant." },
        { role: "user", content: checkPrompt }
      ]
    });

    let parsed;
    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a structured and helpful assistant. ONLY respond with valid JSON. Do not explain." },
          { role: "user", content: checkPrompt }
        ]
      });

      parsed = JSON.parse(gptResponse.choices[0].message.content.trim());

    } catch (err) {
      console.error("❌ GPT did not return valid JSON:\n", err);
      return res.status(500).json({ message: "GPT returned invalid JSON. Try rewording your complaint." });
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

    let finalSummary;

    // ⏪ Fallback to vector similarity if no zip match
    if (!filteredData || filteredData.length === 0 || Object.keys(filteredData[0]).length === 0) {
      console.log("🔄 No filtered data found — falling back to vector similarity search...");

      const similarSummaries = await getSimilarSummaries(complaint);

      if (!similarSummaries.length) {
        console.log("❌ No vector matches. Complaint was:", complaint);
        return res.status(404).json({
          message: "No relevant data found, even after vector search.",
          debug: "Vector search returned 0 results."
        });
      }
      
      const summaryText = similarSummaries
        .map(doc => `ZIP ${doc.zipCode}: ${doc.summary}`)
        .join('\n');

      const vectorPrompt = `
        The user submitted this safety concern: "${complaint}"

        Below are safety summaries from similar ZIP codes (found using semantic similarity):
        ${summaryText}

        Write a helpful, direct safety report for the user based on their concern. Use a calm, informative tone.
      `;

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You summarize safety concerns using similar ZIP code summaries." },
          { role: "user", content: vectorPrompt }
        ]
      });

      finalSummary = summaryResponse.choices[0].message.content.trim();

      return res.status(200).json({
        status: "vector_fallback",
        summary: finalSummary,
        rawData: similarSummaries
      });
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

    finalSummary = summaryResponse.choices[0].message.content.trim();

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
