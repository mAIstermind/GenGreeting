import { GoogleGenAI, Modality, Part } from "@google/genai";

const dataUrlToPart = (dataUrl: string): Part => {
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const data = dataUrl.split(',')[1];
    if (!mimeType || !data) {
        throw new Error("Invalid base64 image data format.");
    }
    return { inlineData: { data, mimeType } };
};

export const createGeminiService = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("An API key must be provided to initialize the Gemini service.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const generateGreetingCardImage = async (firstName: string, promptTemplate: string): Promise<string> => {
        try {
            const prompt = promptTemplate.replace(/\${firstName}/g, firstName);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
            
            throw new Error("No image data found in the API response.");

        } catch (error) {
            console.error("Error generating greeting card image:", error);
            throw new Error("Failed to generate image. The API may be busy or an error occurred.");
        }
    };

    const editGreetingCardImage = async (base64ImageData: string, prompt: string): Promise<string> => {
        try {
            const imagePart = dataUrlToPart(base64ImageData);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        imagePart,
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
            
            throw new Error("No edited image data found in the API response.");

        } catch (error) {
            console.error("Error editing image:", error);
            throw new Error("Failed to edit image.");
        }
    };

    const brandCardImage = async (
        cardDataUrl: string, 
        logoDataUrl: string | null, 
        brandText: string, 
        position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    ): Promise<string> => {
        try {
            if (!logoDataUrl && !brandText) return cardDataUrl; // No branding to add

            const parts: Part[] = [dataUrlToPart(cardDataUrl)];
            
            if (logoDataUrl) {
                parts.push(dataUrlToPart(logoDataUrl));
            }

            const positionText = position.replace('-', ' ');
            let prompt = `Take the main image. In the ${positionText} corner, subtly and professionally place the small logo provided.`;
            if (brandText) {
                prompt += ` Neatly next to or below the logo, add the text: "${brandText}".`
            }
            prompt += ' The branding should be small, clean, and not overpower the main image. It should look like a professional watermark or signature.';
            parts.push({ text: prompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
            
            throw new Error("No branded image data found in the API response.");
        } catch (error) {
            console.error("Error branding image:", error);
            throw new Error("Failed to add branding to the image.");
        }
    };

    const generateImageWithImagen = async (prompt: string): Promise<string> => {
        try {
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
            return `data:image/png;base64,${base64ImageBytes}`;
        } catch (error) {
            console.error("Error generating with Imagen:", error);
            throw new Error("Failed to generate image with Imagen.");
        }
    };

    return {
        generateGreetingCardImage,
        editGreetingCardImage,
        brandCardImage,
        generateImageWithImagen,
    };
};

export type GeminiService = ReturnType<typeof createGeminiService>;
