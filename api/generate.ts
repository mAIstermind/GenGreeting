// /api/generate.ts (Simplified)

// Assuming you have imported necessary libraries (e.g., Gemini SDK, GHL helpers)
// const { GoogleGenAI } = require("@google/genai"); 
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

const GHL_API_URL = 'https://api.msgsndr.com/v1/contacts/';

export default async function handler(req: any, res: any) {
    // 1. Authentication Check (Assume user token/session is passed and verified)
    const { contactId, prompt } = req.body; 

    if (!contactId || !prompt) {
        return res.status(400).json({ error: 'Missing user context or prompt.' });
    }

    try {
        // --- A. GHL Credit Check ---
        // Fetch Contact from GHL to get current credit status
        const fetchContactResponse = await fetch(`${GHL_API_URL}${contactId}`, {
            headers: { 'Authorization': `Bearer ${GHL_API_KEY}` }
        });
        const contactData = await fetchContactResponse.json();
        const used = contactData.customField.pwa_credits_used || 0;
        const quota = contactData.customField.pwa_monthly_quota || 0;

        if (used >= quota) {
            return res.status(403).json({ error: 'Monthly credit quota exceeded. Please upgrade.' });
        }

        // --- B. Consume Credit (CRUCIAL: Update BEFORE Gemini Call) ---
        const newUsed = used + 1;
        const updateCreditResponse = await fetch(`${GHL_API_URL}${contactId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customField: [{ id: 'pwa_credits_used', value: newUsed }]
            })
        });

        if (!updateCreditResponse.ok) {
             throw new Error("Failed to consume credit in GHL.");
        }
        
        // --- C. Call Gemini API Securely ---
        const geminiResponse = await ai.models.generateContent({ /* ... your prompt/config ... */ });
        
        return res.status(200).json({ 
            generatedImage: geminiResponse.data, 
            remainingCredits: quota - newUsed 
        });

    } catch (error) {
        console.error('Generation Error:', error);
        return res.status(500).json({ error: 'Image generation failed.' });
    }
}