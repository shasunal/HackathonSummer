import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getFilteredData } from '../utils/getFilteredData.js';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/complaintSubmit', async (req, res) => {
  try {
    const { complaint } = req.body;
    if (!complaint) return res.status(400).json({ message: 'Missing complaint text' });

    // 🧠 Step 1: GPT checks info and picks fields
    const checkPrompt = `
        A user submitted this: "${complaint}"

        You are a public safety assistant.

        First, check if the user has included:
        - A location (zip code, neighborhood, or borough)
        - A time of day (e.g. morning, night)
        - User context (gender and/or age)

        If anything is missing, return:
        {
        "status": "missing",
        "missing": ["what’s missing here"]
        }

        If all info is present, return:
        {
        "status": "complete",
        "selected_fields": ["pick 3–5 most relevant fields from the schema below"]
        }

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
      return res.status(200).json(parsed); // tell frontend to reprompt
    }

    const selectedFields = parsed.selected_fields;

    // 📦 Step 2: Query MongoDB using selected fields
    const filteredData = await getFilteredData(complaint, selectedFields); // function you will define

    if (!filteredData || filteredData.length === 0) {
      return res.status(404).json({ message: "No relevant data found for this query." });
    }

    // 📢 Step 3: Final GPT summary based on filtered data
    const summaryPrompt = `
        The user submitted this safety concern: "${complaint}"

        You have access to filtered NYC public safety data:
        ${JSON.stringify(filteredData, null, 2)}

        Give a **brief and clear summary** of whether it is safe for this person to travel there. Base your response on crime levels, time of day, and the user's context (gender/age). Avoid excessive detail. Max 7 sentences.
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
      rawData: filteredData
    });

  } catch (error) {
    console.error("🔥 complaintSubmit error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
