// /api/generate.ts
import { GoogleGenAI, Modality } from "@google/genai";

// --- START: CONFIGURATION ---

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey });

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

const GHL_USED_FIELD_ID = process.env.GHL_USED_FIELD_ID;
const GHL_QUOTA_FIELD_ID = process.env.GHL_QUOTA_FIELD_ID;

// --- END: CONFIGURATION ---

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GHL_API_KEY || !GHL_USED_FIELD_ID || !GHL_QUOTA_FIELD_ID) {
        console.error("Server configuration error: GHL API Key or Custom Field IDs are missing.");
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
        
        const usedField = customFields.find((f: any) => f.id === GHL_USED_FIELD_ID);
        const quotaField = customFields.find((f: any) => f.id === GHL_QUOTA_FIELD_ID);
        
        const usedCredits = Number(usedField?.value) || 0;
        const monthlyQuota = Number(quotaField?.value) || 0;

        if (usedCredits >= monthlyQuota) {
            return res.status(403).json({ error: 'Your monthly credit quota has been exceeded. Please upgrade your plan.' });
        }

        // --- Step 2: Consume a credit BEFORE making the AI call ---
        const newUsedCount = usedCredits + 1;
        const updateCreditResponse = await fetch(`${GHL_API_URL}${contactId}`, {
            method: 'PUT',
            headers: ghlHeaders,
            body: JSON.stringify({
                customFields: [{ id: GHL_USED_FIELD_ID, field_value: newUsedCount }]
            })
        });

        if (!updateCreditResponse.ok) {
             const errorBody = await updateCreditResponse.text();
             console.error("GHL Credit Update Error:", errorBody);
             throw new Error("Failed to update credit usage in the CRM.");
        }
        
        // --- Step 3: Call the Gemini API to generate the image ---
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        
        let imageUrlResult;
        if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
            const imagePart = geminiResponse.candidates[0].content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                imageUrlResult = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }
        if (!imageUrlResult) throw new Error("No image data found in Gemini API response.");

        // --- Step 4: Return the result to the client ---
        return res.status(200).json({ 
            generatedImage: imageUrlResult, 
            remainingCredits: monthlyQuota - newUsedCount 
        });

    } catch (error: any) {
        console.error('API /generate handler failed:', error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred during image generation.' });
    }
}