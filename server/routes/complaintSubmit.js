import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

//API Key for Chatgpt
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/complaintSubmit', async (req, res) => {
    try {
        const {complaint} = req.body;

        if (!complaint) {
            return res.status(400).json({ message: 'Missing complaint text' });
        }

        //First GPT prompt: Check for key info
        const gptCheckPrompt = `
            A user submitted: "${complaint}"

            You are a public safety assistant. Check if this includes:
            - Location (neighborhood, zip, borough)
            - Time of day (e.g., night, 10pm)
            - User context (gender and/or age)

            If anything is missing, reply: "Missing: [what’s missing]".
            If everything is present, reply: "All good".
        `;

        const checkResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You help NYC users assess safety risk based on what they submit." },
                { role: "user", content: gptCheckPrompt }
            ],
            temperature: 0.2,
        });

        const checkResult = checkResponse.choices[0].message.content.trim();

        //GPT says we need more info
        if (checkResult.toLowerCase().startsWith("missing")) {
            return res.status(400).json({ message: checkResult });
        }

        //Second GPT prompt: Full safety analysis
        const safetyAnalysisPrompt = `
            Analyze the following safety situation:

            "${complaint}"

            Step-by-step, do the following:
            1. Extract user demographics and travel context.
            2. Identify safety risks based on NYC context (use known public safety info).
            3. Suggest if it's safe or not and why.
            4. Offer safety advice (e.g., travel in a group, avoid certain hours, etc.).

            Format the result clearly for users.
        `;

        const safetyResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You analyze NYC safety requests step-by-step." },
                { role: "user", content: safetyAnalysisPrompt }
            ],
            temperature: 0.7,
        });

        const finalAnalysis = safetyResponse.choices[0].message.content.trim();
        const zipcode = "10010";
        
        return res.status(201).json({ message: "Analysis complete", result: finalAnalysis, zipcode: zipcode });
    } catch (err) {
        console.error('Error saving Complaint:', err);
        res.status(500).json({ message: 'Server error during Complaint upload' });
    }
});

export default router;
