import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { AgencyConfig } from "../types";
import { Buffer } from "buffer";

// Helper to get the appropriate API key
const getApiKey = (): string => {
    try {
        const agencyConfigStr = localStorage.getItem('aigreetings_agency_config');
        if (agencyConfigStr) {
            const agencyConfig: AgencyConfig = JSON.parse(agencyConfigStr);
            if (agencyConfig.apiKey) return agencyConfig.apiKey;
        }
    } catch (e) {
        console.warn("Could not parse agency config", e);
    }
    // Fallback to environment variable. In Vite, this is replaced at build time.
    return process.env.API_KEY || '';
};

const getAiClient = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is missing. Please ensure process.env.API_KEY is set or an agency key is configured.");
    }
    return new GoogleGenAI({ apiKey });
};

const dataUrlToPart = (dataUrl: string): Part => {
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const data = dataUrl.split(',')[1];
    if (!mimeType || !data) {
        throw new Error("Invalid base64 image data format.");
    }
    return { inlineData: { data, mimeType } };
};

const generatePromptConcept = async (theme: string, contactName: string): Promise<string> => {
    const ai = getAiClient();
    const systemInstruction = `You are a creative assistant. Your task is to generate a detailed and imaginative prompt for an AI image generator. The prompt should be based on a theme provided by the user and personalized with the recipient's first name. The goal is to create a visually stunning and unique greeting card image. Only return the prompt text itself, without any introductory phrases.`;
    const userPrompt = `Theme: "${theme}"\nRecipient's First Name: ${contactName.split(' ')[0]}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { systemInstruction },
    });
    return (response.text ?? '').trim();
};

const generateGreetingCardImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    if (response.candidates && response.candidates.length > 0) {
        const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
    }
    throw new Error("No image data found in API response.");
};

const generatePersonalizedCard = async (prompt: string, profileImageUrl: string): Promise<string> => {
    const ai = getAiClient();
    let profileImagePart: Part;

    if (profileImageUrl.startsWith('data:image/')) {
        profileImagePart = dataUrlToPart(profileImageUrl);
    } else {
        try {
            const response = await fetch(profileImageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            profileImagePart = dataUrlToPart(base64);
        } catch (e: any) {
            console.warn("CORS error or fetch failure for image, proceeding without personalization image.", e);
            // Fallback to standard generation if we can't get the image
            return generateGreetingCardImage(prompt);
        }
    }

    const textPrompt = `You are an expert graphic designer. Create a greeting card based on the following theme: "${prompt}". You have also been provided with a separate image (a logo or profile picture). You MUST incorporate this second image into your final creation in a way that is subtle, professional, and aesthetically pleasing. For example, you could place it in a corner like a watermark, or inside a picture frame within the scene, or as a character's face if it's a portrait. The final result should be a single, unified image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: textPrompt }, profileImagePart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    if (response.candidates && response.candidates.length > 0) {
        const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
    }
    throw new Error("No image data found in API response.");
};

const editGreetingCardImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    const imagePart = dataUrlToPart(base64ImageData);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    if (response.candidates && response.candidates.length > 0) {
        const editedImagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
        if (editedImagePart?.inlineData) {
            return `data:${editedImagePart.inlineData.mimeType};base64,${editedImagePart.inlineData.data}`;
        }
    }
    throw new Error("No edited image data found.");
};

const brandCardImage = async (
    cardDataUrl: string,
    logoDataUrl: string | null,
    brandText: string,
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
): Promise<string> => {
    if (!logoDataUrl && !brandText) return cardDataUrl;

    const ai = getAiClient();
    const parts: Part[] = [dataUrlToPart(cardDataUrl)];
    if (logoDataUrl) parts.push(dataUrlToPart(logoDataUrl));
    
    const positionText = position.replace('-', ' ');
    let brandPrompt = `Take the main image. In the ${positionText} corner, subtly and professionally place the small logo provided.`;
    if (brandText) brandPrompt += ` Neatly next to or below the logo, add the text: "${brandText}".`
    brandPrompt += ' The branding should be small, tasteful, and not obscure the main image content. Return only the final combined image.';

    parts.push({ text: brandPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] }
    });

    if (response.candidates && response.candidates.length > 0) {
        const imagePart = response.candidates[0].content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
    }
    throw new Error("No branded image data found.");
};

const generateImageWithImagen = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' }
    });
    
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("No image data found in Imagen API response.");
    }
    return `data:image/png;base64,${base64ImageBytes}`;
};

const checkApiHealth = async (): Promise<{ status: string }> => {
    // Simple client-side check if key is present
    const key = getApiKey();
    if (!key) throw new Error("API Key is missing.");
    return { status: 'ok' };
};

export const geminiService = {
    checkApiHealth,
    generatePromptConcept,
    generateGreetingCardImage,
    generatePersonalizedCard,
    editGreetingCardImage,
    brandCardImage,
    generateImageWithImagen,
};

export type GeminiService = typeof geminiService;