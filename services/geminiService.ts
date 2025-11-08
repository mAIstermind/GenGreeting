
const callApi = async (action: string, payload: object) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'API request failed');
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

export const geminiService = {
    generatePromptConcept,
    generateGreetingCardImage,
    editGreetingCardImage,
    brandCardImage,
    generateImageWithImagen,
};

export type GeminiService = typeof geminiService;