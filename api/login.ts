// /api/generate.ts
import { Buffer } from "buffer";
import { GoogleGenAI } from "@google/genai";

// --- START: CONFIGURATION ---

// Initialize Gemini SDK
// This key is expected to be set in your Vercel/Netlify environment variables.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    // This will cause the function to fail on startup if the key is missing.
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey });

// GoHighLevel (GHL) API Configuration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

// IMPORTANT: Replace these with your actual Custom Field IDs from your GHL account.
const GHL_CREDITS_USED_FIELD_ID = 'YOUR_GHL_CREDITS_USED_FIELD_ID'; 
const GHL_MONTHLY_QUOTA_FIELD_ID = 'YOUR_GHL_MONTHLY_QUOTA_FIELD_ID';

// --- END: CONFIGURATION ---

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GHL_API_KEY) {
        return res.status(500).json({ error: 'GHL service is not configured on the server.' });
    }

    const { contactId, prompt } = req.body; 

    if (!contactId || !prompt) {
        return res.status(400).json({ error: 'Missing contactId or prompt in the request body.' });
    }

    try {
        // --- Step 1: Fetch contact from GHL and check credit balance ---
        const ghlHeaders = {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };

        const fetchContactResponse = await fetch(`${GHL_API_URL}${contactId}`, { headers: ghlHeaders });
        if (!fetchContactResponse.ok) {
            console.error("GHL Fetch Error:", await fetchContactResponse.text());
            throw new Error('Failed to fetch contact details from the CRM.');
        }

        const ghlResponse = await fetchContactResponse.json();
        const customFields = ghlResponse.contact?.customFields || [];
        
        const usedField = customFields.find((f: any) => f.id === GHL_CREDITS_USED_FIELD_ID);
        const quotaField = customFields.find((f: any) => f.id === GHL_MONTHLY_QUOTA_FIELD_ID);
        
        const usedCredits = Number(usedField?.field_value) || 0;
        const monthlyQuota = Number(quotaField?.field_value) || 0;

        if (usedCredits >= monthlyQuota) {
            return res.status(403).json({ error: 'Your monthly credit quota has been exceeded. Please upgrade your plan.' });
        }

        // --- Step 2: Consume a credit BEFORE making the AI call ---
        const newUsedCount = usedCredits + 1;
        const updateCreditResponse = await fetch(`${GHL_API_URL}${contactId}`, {
            method: 'PUT',
            headers: ghlHeaders,
            body: JSON.stringify({
                // The correct payload structure for updating GHL custom fields
                customFields: [{ id: GHL_CREDITS_USED_FIELD_ID, field_value: newUsedCount }]
            })
        });

        if (!updateCreditResponse.ok) {
             const errorBody = await updateCreditResponse.text();
             console.error("GHL Credit Update Error:", errorBody);
             throw new Error("Failed to update credit usage in the CRM.");
        }
        
        // --- Step 3: Call the Gemini API to generate the image ---
        // NOTE: This part is a placeholder. You need to replace this with the
        // actual model and parameters you intend to use, similar to the logic in `api/gemini.ts`.
        // For example:
        // const geminiResponse = await ai.models.generateContent({ model: 'gemini-pro', contents: prompt });
        // const resultText = geminiResponse.text;
        const mockGeminiResponse = { data: "mock_image_data_from_gemini_api" }; // Placeholder response
        
        // --- Step 4: Return the result to the client ---
        return res.status(200).json({ 
            generatedImage: mockGeminiResponse.data, 
            remainingCredits: monthlyQuota - newUsedCount 
        });

    } catch (error: any) {
        console.error('API /generate handler failed:', error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred during image generation.' });
    }
}
