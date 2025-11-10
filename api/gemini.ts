// FIX: Import 'Buffer' to make it available in the serverless function scope.
import { Buffer } from "buffer";
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { scrypt, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";

// This file is a Vercel serverless function.
// It acts as a secure proxy to the Google Gemini API and handles user authentication via the GHL API.

// --- START: UTILITIES ---

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password with a random salt using scrypt.
 * @param password The plaintext password.
 * @returns A promise that resolves to the "salt:hash" string.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a scrypt hash.
 * @param password The plaintext password to check.
 * @param hash The "salt:hash" string from the database.
 * @returns A promise that resolves to true if the password is correct, false otherwise.
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(keyBuffer, derivedKey);
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Encodes a string in Base64URL format.
 */
function base64urlEncode(str: string) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Creates a secure JSON Web Token (JWT).
 * @param payload The data to include in the token (e.g., user email).
 * @returns The signed JWT string.
 */
function createToken(payload: { email: string }): string {
    if (!JWT_SECRET) {
        // This should not happen in production if environment is configured correctly.
        throw new Error("JWT_SECRET is not configured.");
    }
    const header = { alg: 'HS256', typ: 'JWT' };
    const extendedPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7-day expiry
    };
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(extendedPayload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest('base64')
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        
    return `${signatureInput}.${signature}`;
}

/**
 * A basic security measure to mitigate Server-Side Request Forgery (SSRF).
 * In a real production environment, you should use a more robust solution.
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
        ];
        if (url.hostname === 'localhost') return true;
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
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

// --- END: UTILITIES ---


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // FIX: Add a critical validation check to prevent crashes on malformed requests.
    if (!req.body) {
        return res.status(400).json({ error: 'Missing or malformed request body.' });
    }
    
    const { action, ...payload } = req.body;

    // --- START: AUTHENTICATION ACTIONS ---
    if (action === 'register' || action === 'login') {
        const GHL_API_KEY = process.env.GHL_API_KEY;
        const GHL_PASSWORD_FIELD_ID = process.env.GHL_PASSWORD_FIELD_ID;
        
        if (!GHL_API_KEY || !GHL_PASSWORD_FIELD_ID || !JWT_SECRET) {
            return res.status(500).json({ error: 'Authentication service is not configured on the server.' });
        }
        
        const ghlApi = {
            baseUrl: 'https://services.leadconnectorhq.com/contacts',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28'
            }
        };

        const { email, password } = payload;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        try {
            if (action === 'register') {
                // 1. Check if contact already exists
                const searchRes = await fetch(`${ghlApi.baseUrl}/lookup?email=${encodeURIComponent(email)}`, { headers: ghlApi.headers });
                if (searchRes.ok) {
                    const existingContacts = await searchRes.json();
                    if (existingContacts.contacts && existingContacts.contacts.length > 0) {
                        return res.status(409).json({ error: 'An account with this email already exists.' });
                    }
                }
                
                // 2. Hash password
                const hashedPassword = await hashPassword(password);

                // 3. Create contact in GHL
                const createRes = await fetch(ghlApi.baseUrl, {
                    method: 'POST',
                    headers: ghlApi.headers,
                    body: JSON.stringify({
                        email: email.toLowerCase(),
                        customFields: [
                            { id: GHL_PASSWORD_FIELD_ID, field_value: hashedPassword }
                        ]
                    })
                });

                if (!createRes.ok) {
                    const errorBody = await createRes.text();
                    console.error("GHL Create Error:", errorBody);
                    throw new Error('Failed to create account in CRM.');
                }
                
                const ghlContact = await createRes.json();
                const user = { email: ghlContact.contact.email };
                const token = createToken(user);
                return res.status(201).json({ user, token });
            }

            if (action === 'login') {
                // 1. Find contact by email
                const searchRes = await fetch(`${ghlApi.baseUrl}/lookup?email=${encodeURIComponent(email)}`, { headers: ghlApi.headers });
                if (!searchRes.ok) throw new Error(); // Triggers generic error below
                const existingContacts = await searchRes.json();
                const ghlContact = existingContacts.contacts?.[0];

                if (!ghlContact) {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }

                // 2. Find the stored password hash
                const passwordField = ghlContact.customFields?.find((field: any) => field.id === GHL_PASSWORD_FIELD_ID);
                const storedHash = passwordField?.field_value;

                if (!storedHash) {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }

                // 3. Verify password
                const isValid = await verifyPassword(password, storedHash);
                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }

                const user = { email: ghlContact.email };
                const token = createToken(user);
                return res.status(200).json({ user, token });
            }
        } catch (error: any) {
            console.error(`Auth action '${action}' failed:`, error);
            return res.status(500).json({ error: 'An internal server error occurred during authentication.' });
        }
    }
    // --- END: AUTHENTICATION ACTIONS ---
    
    // --- START: GEMINI ACTIONS ---
    // Prioritize client-provided API key (for whitelabel agencies) over the default system key.
    const { apiKey: clientApiKey } = payload;
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
                let profileImagePart: Part;

                if (profileImageUrl.startsWith('data:image/')) {
                    // Handle base64 data URL
                    profileImagePart = dataUrlToPart(profileImageUrl);
                } else {
                    // Handle public URL
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
                    
                    profileImagePart = {
                        inlineData: {
                            mimeType: contentType,
                            data: base64Data,
                        }
                    };
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
