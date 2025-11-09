

import type { AgencyConfig } from "../types";

const callApi = async (action: string, payload: object) => {
    
    // Check for an agency-specific API key and add it to the payload if it exists.
    let fullPayload: object = { action, ...payload };
    try {
        const agencyConfigStr = localStorage.getItem('aigreetings_agency_config');
        if (agencyConfigStr) {
            const agencyConfig: AgencyConfig = JSON.parse(agencyConfigStr);
            if (agencyConfig.apiKey) {
                fullPayload = { ...fullPayload, apiKey: agencyConfig.apiKey };
            }
        }
    } catch (e) {
        console.warn("Could not parse agency config from localStorage", e);
    }
    
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullPayload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            // It might be a JSON error object, so we try to parse it.
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || 'API request failed');
        } catch (e) {
            // If parsing fails, it's a plain text error from the server.
            throw new Error(errorText || 'API request failed');
        }
    }

    const result = await response.json();
    return result.data;
};


const generatePromptConcept = async (theme: string, contactName: string): Promise<string> => {
    return callApi('generatePromptConcept', { theme, contactName });
};

const generateGreetingCardImage = async (prompt: string): Promise<string> => {
    return callApi('generateGreetingCardImage', { prompt });
};

const generatePersonalizedCard = async (prompt: string, profileImageUrl: string): Promise<string> => {
    return callApi('generatePersonalizedCard', { prompt, profileImageUrl });
};

const editGreetingCardImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    return callApi('editGreetingCardImage', { base64ImageData, prompt });
};

const brandCardImage = async (
    cardDataUrl: string,
    logoDataUrl: string | null,
    brandText: string,
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
): Promise<string> => {
    return callApi('brandCardImage', { cardDataUrl, logoDataUrl, brandText, position });
};

const generateImageWithImagen = async (prompt: string): Promise<string> => {
    return callApi('generateImageWithImagen', { prompt });
};

const checkApiHealth = async (): Promise<{ status: string }> => {
    return callApi('healthCheck', {});
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