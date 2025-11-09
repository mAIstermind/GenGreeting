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
                result = (response.text ?? '').trim();
                break;
            }

            case 'generateGreetingCardImage': {
                const { prompt } = payload;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                if (response.candidates && response.candidates.length > 0) {
                    const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
                    if (imagePart?.inlineData) {
                        result = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No image data found in API response.");
                break;
            }

            case 'generatePersonalizedCard': {
                const { prompt, profileImageUrl } = payload;
                
                if (!isAllowedUrl(profileImageUrl)) {
                    throw new Error('Image URL is from a disallowed or invalid domain.');
                }
                
                const imageResponse = await fetch(profileImageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image from URL: ${profileImageUrl}`);
                }
                const contentType = imageResponse.headers.get('content-type');
                if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
                    throw new Error('Profile image must be a JPG, PNG, or WEBP.');
                }
                const contentLength = imageResponse.headers.get('content-length');
                if (contentLength && parseInt(contentLength, 10) > 4 * 1024 * 1024) {
                    throw new Error('Profile image size must be less than 4MB.');
                }

                const buffer = await imageResponse.arrayBuffer();
                const base64Data = Buffer.from(buffer as unknown as ArrayBuffer).toString('base64');
                
                const profileImagePart: Part = {
                    inlineData: {
                        mimeType: contentType,
                        data: base64Data,
                    }
                };
                const textPrompt = `You are an expert graphic designer. Create a greeting card based on the following theme: "${prompt}". You have also been provided with a separate image (a logo or profile picture). You MUST incorporate this second image into your final creation in a way that is subtle, professional, and aesthetically pleasing. For example, you could place it in a corner like a watermark, or inside a picture frame within the scene, or as a character's face if it's a portrait. The final result should be a single, unified image.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: textPrompt }, profileImagePart] },
                    config: { responseModalities: [Modality.IMAGE] },
                });

                if (response.candidates && response.candidates.length > 0) {
                    const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
                    if (imagePart?.inlineData) {
                        result = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No image data found in API response.");
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
                
                if (response.candidates && response.candidates.length > 0) {
                    const editedImagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
                    if (editedImagePart?.inlineData) {
                        result = `data:${editedImagePart.inlineData.mimeType};base64,${editedImagePart.inlineData.data}`;
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
                prompt += ' The branding should be small, tasteful, and not obscure the main image content. Return only the final combined image.';

                parts.push({ text: prompt });

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts },
                    config: { responseModalities: [Modality.IMAGE] }
                });

                if (response.candidates && response.candidates.length > 0) {
                    const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
                     if (imagePart?.inlineData) {
                        result = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                    }
                }
                if (!result) throw new Error("No branded image data found in API response.");
                break;
            }
            
            case 'generateImageWithImagen': {
                const { prompt } = payload;
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt,
                    config: { numberOfImages: 1, outputMimeType: 'image/png' }
                });
                
                const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
                if (!base64ImageBytes) {
                    throw new Error("No image data found in Imagen API response.");
                }
                result = `data:image/png;base64,${base64ImageBytes}`;
                break;
            }

            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }

        res.status(200).json({ data: result });

    } catch (error: any) {
        console.error(`Error in action '${action}':`, error);
        res.status(500).json({ error: error.message || 'An internal server error occurred' });
    }
}