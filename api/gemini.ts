import { GoogleGenAI, Modality, Part } from "@google/genai";

// This file is a Vercel serverless function.
// It acts as a secure proxy to the Google Gemini API.
// The API_KEY is read from Vercel's environment variables.

const dataUrlToPart = (dataUrl: string): Part => {
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const data = dataUrl.split(',')[1];
    if (!mimeType || !data) {
        throw new Error("Invalid base64 image data format.");
    }
    return { inlineData: { data, mimeType } };
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { action, ...payload } = req.body;
        let result;

        switch (action) {
            case 'generatePromptConcept': {
                const { theme, contactName } = payload;
                const systemInstruction = `You are a creative assistant. Your task is to generate a detailed and imaginative prompt for an AI image generator. The prompt should be based on a theme provided by the user and personalized with the recipient's first name. The goal is to create a visually stunning and unique greeting card image. Only return the prompt text itself, without any introductory phrases.`;
                const userPrompt = `Theme: "${theme}"\nRecipient's First Name: ${contactName.split(' ')[0]}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: { systemInstruction },
                });
                result = response.text.trim();
                break;
            }

            case 'generateGreetingCardImage': {
                const { prompt } = payload;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        result = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No image data found in response.");
                break;
            }
            
            case 'editGreetingCardImage': {
                const { base64ImageData, prompt } = payload;
                const imagePart = dataUrlToPart(base64ImageData);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [imagePart, { text: prompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                 for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        result = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No edited image data found.");
                break;
            }
            
            case 'brandCardImage': {
                const { cardDataUrl, logoDataUrl, brandText, position } = payload;
                if (!logoDataUrl && !brandText) {
                    result = cardDataUrl;
                    break;
                }
                const parts: Part[] = [dataUrlToPart(cardDataUrl)];
                if (logoDataUrl) parts.push(dataUrlToPart(logoDataUrl));
                const positionText = position.replace('-', ' ');
                let prompt = `Take the main image. In the ${positionText} corner, subtly and professionally place the small logo provided.`;
                if (brandText) prompt += ` Neatly next to or below the logo, add the text: "${brandText}".`
                prompt += ' The branding should be small, clean, and not overpower the main image. It should look like a professional watermark or signature.';
                parts.push({ text: prompt });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        result = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No branded image data found.");
                break;
            }
            
            case 'generateImageWithImagen': {
                const { prompt } = payload;
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: prompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/png',
                      aspectRatio: '1:1',
                    },
                });
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                result = `data:image/png;base64,${base64ImageBytes}`;
                break;
            }
            
            default:
                return res.status(400).json({ error: 'Invalid action specified.' });
        }

        return res.status(200).json({ data: result });

    } catch (error: any) {
        console.error(`Error in action '${req.body.action}':`, error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}