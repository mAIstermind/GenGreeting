// /api/login.ts
import { compare } from 'bcryptjs';

// --- START: CONFIGURATION ---

const GHL_API_KEY = process.env.GHL_API_KEY;
// Using the modern GHL API endpoint for consistency across the application.
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

// IMPORTANT: The custom field IDs below must be set in your Vercel/Netlify environment variables.
// These variables have been aligned with the documentation to remove the `_PWA_` prefix.
const GHL_PASSWORD_FIELD_ID = process.env.GHL_PASSWORD_FIELD_ID; 
const GHL_QUOTA_FIELD_ID = process.env.GHL_QUOTA_FIELD_ID;       
const GHL_USED_FIELD_ID = process.env.GHL_USED_FIELD_ID;         
const GHL_PLAN_FIELD_ID = process.env.GHL_PLAN_FIELD_ID;         

// --- END: CONFIGURATION ---

/**
 * Helper to find a custom field's value from the GHL contact object's customFields array.
 * @param customFields - The array of custom fields from the GHL contact.
 * @param fieldId - The ID of the custom field to find.
 * @returns The value of the custom field, or undefined if not found.
 */
function getCustomFieldValue(customFields: any[], fieldId: string | undefined): any {
    if (!fieldId || !Array.isArray(customFields)) {
        return undefined;
    }
    const field = customFields.find((f: any) => f.id === fieldId);
    // The GHL API (v2021-07-28) returns the custom field data in the 'value' property.
    return field?.value;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Step-tracking variable for better error logging
    let step = 'START';
    
    try {
        step = 'VALIDATE_CONFIG_AND_BODY';
        // Validate server configuration
        if (!GHL_API_KEY || !GHL_PASSWORD_FIELD_ID) {
            console.error("Server configuration error: GHL_API_KEY or GHL_PASSWORD_FIELD_ID is missing.");
            return res.status(500).json({ error: 'Authentication service is not configured correctly on the server.' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const ghlHeaders = {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };

        step = 'LOOKUP_CONTACT';
        const searchResponse = await fetch(`${GHL_API_URL}lookup?email=${encodeURIComponent(email)}`, { headers: ghlHeaders });
        
        if (!searchResponse.ok) {
            const errorBody = await searchResponse.text();
            console.error("GHL Contact Lookup Error:", errorBody);
            // Don't expose detailed CRM errors to the client
            throw new Error('Could not verify user with CRM.');
        }

        const searchData = await searchResponse.json();
        const contact = searchData.contacts?.[0];

        if (!contact) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        step = 'EXTRACT_PASSWORD_HASH';
        const storedHash = getCustomFieldValue(contact.customFields, GHL_PASSWORD_FIELD_ID);
        
        if (!storedHash) {
             return res.status(401).json({ error: 'Account not fully set up. Please register again.' });
        }
        
        step = 'COMPARE_PASSWORD';
        const isMatch = await compare(password, storedHash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        
        step = 'FINALIZE_RESPONSE';
        const userData = {
            contactId: contact.id,
            email: contact.email,
            quota: getCustomFieldValue(contact.customFields, GHL_QUOTA_FIELD_ID) || 0,
            used: getCustomFieldValue(contact.customFields, GHL_USED_FIELD_ID) || 0,
            plan: getCustomFieldValue(contact.customFields, GHL_PLAN_FIELD_ID) || 'Free Trial'
        };

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful.', 
            user: userData
        });

    } catch (error: any) {
        console.error('--- LOGIN API CRASH ---');
        console.error(`Failed at step: ${step}`);
        console.error('Request Email:', req.body.email); // Log email for context, but never the password
        console.error('Error Message:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({ error: 'Login failed due to an internal server error.' });
    }
}