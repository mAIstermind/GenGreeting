
import { GoogleGenAI, Modality, Part } from "@google/genai";

// This file is a Vercel serverless function.
// It acts as a secure proxy to the Google Gemini API.
// It prioritizes an API key sent from the client, falling back to the one in Vercel's environment variables.

/**
 * A basic security measure to mitigate Server-Side Request Forgery (SSRF).
 * In a real production environment, you should use a more robust solution,
 * such as a strict allowlist of trusted image domains or an image proxy service
 * like Cloudflare Images or imgix.
 * @param urlString The URL to validate.
 * @returns True if the URL is from an allowed host, false otherwise.
 */
const isAllowedUrl = (urlString: string): boolean => {
    try {
        const url = new URL(urlString);
        const allowedHosts = [
            'images.unsplash.com',
            'i.imgur.com',
            'storage.googleapis.com',
            // Add other trusted public image domains here
        ];
        // Allow localhost for local development environments
        if (url.hostname === 'localhost') {
            return true;
        }
        // Ensure the protocol is secure
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return false;
        }
        // Check if the hostname is one of the allowed hosts or a subdomain of them.
        return allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch (e) {
        return false;
    }
};


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

    // Prioritize client-provided API key (for whitelabel agencies) over the default system key.
    const { action, apiKey: clientApiKey, ...payload } = req.body;
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'A Gemini API key is not configured. The application cannot function without it.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        let result;

        switch (action) {
            case 'healthCheck': {
                result = { status: 'ok' };
                break;
            }
            
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

            case 'generatePersonalizedCard': {
                const { prompt, profileImageUrl } = payload;
                
                // Security: Validate the URL to prevent SSRF attacks.
                if (!isAllowedUrl(profileImageUrl)) {
                    throw new Error('Image URL is from a disallowed or invalid domain.');
                }
                
                 // 1. Fetch the profile image
                const imageResponse = await fetch(profileImageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image from URL: ${profileImageUrl}`);
                }
                const contentType = imageResponse.headers.get('content-type');
                if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
                    throw new Error('Profile image must be a JPG, PNG, or WEBP.');
                }
                const contentLength = imageResponse.headers.get('content-length');
                // Vercel has a 4.5MB payload limit. We set a 4MB limit to be safe.
                if (contentLength && parseInt(contentLength, 10) > 4 * 1024 * 1024) {
                    throw new Error('Profile image size must be less than 4MB.');
                }

                const buffer = await imageResponse.arrayBuffer();
                // FIX: Explicitly cast ArrayBuffer to Buffer for Node.js environment, removing need for @ts-ignore.
                const base64Data = Buffer.from(buffer as unknown as ArrayBuffer).toString('base64');
                
                const profileImagePart: Part = {
                    inlineData: {
                        mimeType: contentType,
                        data: base64Data,
                    }
                };
                 // 2. Construct the combined prompt
                const textPrompt = `You are an expert graphic designer. Create a greeting card based on the following theme: "${prompt}". You have also been provided with a separate image (a logo or profile picture). You MUST incorporate this second image into your final creation in a way that is subtle, professional, and aesthetically pleasing. For example, you could place it in a corner like a watermark, or inside a picture frame within the scene, or as a character's face if it's a portrait. The final result should be a single, unified image.`;

                // 3. Call Gemini
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: textPrompt }, profileImagePart] },
                    config: { responseModalities: [Modality.IMAGE] },
                });

                // 4. Return result
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
