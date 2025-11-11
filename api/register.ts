// /api/register.ts
import bcrypt from 'bcryptjs';

// --- START: CONFIGURATION ---

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

// IMPORTANT: These custom field IDs must be set in your Vercel/Netlify environment variables.
// These variables have been aligned with the documentation to remove the `_PWA_` prefix.
const GHL_PASSWORD_FIELD_ID = process.env.GHL_PASSWORD_FIELD_ID;
const GHL_QUOTA_FIELD_ID = process.env.GHL_QUOTA_FIELD_ID;
const GHL_USED_FIELD_ID = process.env.GHL_USED_FIELD_ID;
const GHL_PLAN_FIELD_ID = process.env.GHL_PLAN_FIELD_ID;

// The specific tag that identifies a user who should get a bonus.
const WEBINAR_ATTENDEE_TAG = 'pwa-webinar-attendee'; 

// --- END: CONFIGURATION ---


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Server configuration check
    if (!GHL_API_KEY || !GHL_PASSWORD_FIELD_ID || !GHL_QUOTA_FIELD_ID || !GHL_USED_FIELD_ID || !GHL_PLAN_FIELD_ID) {
        console.error("Server configuration error: One or more GHL environment variables are missing.");
        return res.status(500).json({ error: 'Registration service is not configured correctly on the server.' });
    }

    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Step-tracking variable for better error logging
    let step = 'START';

    try {
        const ghlHeaders = {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };

        step = 'HASH_PASSWORD';
        const hashedPassword = await bcrypt.hash(password, 10); 

        step = 'LOOKUP_CONTACT';
        const searchResponse = await fetch(`${GHL_API_URL}lookup?email=${encodeURIComponent(email)}`, { headers: ghlHeaders });
        
        let existingContact = null;
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            existingContact = searchData.contacts?.[0];
        } else if (searchResponse.status !== 404) {
            // If it's not a 404 (not found), it's a real error.
            const errorText = await searchResponse.text();
            console.error("GHL Contact Lookup Error:", errorText);
            throw new Error('Could not verify user with CRM.');
        }
        
        step = 'DETERMINE_PLAN_AND_TAGS';
        // Proactively merge tags instead of overwriting them.
        const existingTags = new Set(existingContact?.tags || []);
        existingTags.add('pwa-free-trial');

        const isWebinarAttendee = existingContact?.tags?.includes(WEBINAR_ATTENDEE_TAG);
        const initialQuota = isWebinarAttendee ? 50 : 10;
        const initialPlan = isWebinarAttendee ? 'Webinar Free Trial' : 'Free Trial';

        step = 'PREPARE_UPSERT_DATA';
        const contactData = {
            email: email.toLowerCase(),
            firstName: firstName || '',
            lastName: lastName || '',
            tags: Array.from(existingTags), // Use the merged set of tags
            customFields: [
                { id: GHL_PASSWORD_FIELD_ID, field_value: hashedPassword },
                { id: GHL_QUOTA_FIELD_ID, field_value: initialQuota },
                { id: GHL_USED_FIELD_ID, field_value: 0 },
                { id: GHL_PLAN_FIELD_ID, field_value: initialPlan }
            ]
        };

        step = 'CALL_UPSERT_API';
        const upsertResponse = await fetch(`${GHL_API_URL}upsert`, {
            method: 'POST',
            headers: ghlHeaders,
            body: JSON.stringify(contactData)
        });

        if (!upsertResponse.ok) {
            const errorText = await upsertResponse.text();
            console.error("GHL Upsert Error:", errorText);
            // This is a common failure point if a custom field ID is wrong.
            throw new Error(`GHL API Error: Could not create or update contact. This may be due to an incorrect custom field ID in the server configuration.`);
        }

        step = 'PARSE_UPSERT_RESPONSE';
        const ghlContactResponse = await upsertResponse.json();
        
        // Add a check to ensure the response structure is as expected before accessing nested properties.
        if (!ghlContactResponse?.contact?.id) {
            console.error("Unexpected GHL Upsert Response:", ghlContactResponse);
            throw new Error('GHL API returned an unexpected response structure after upsert.');
        }

        step = 'FINALIZE_RESPONSE';
        return res.status(200).json({ 
            success: true, 
            message: 'Registration successful. Credits have been granted.',
            user: {
                contactId: ghlContactResponse.contact.id,
                email: ghlContactResponse.contact.email,
                quota: initialQuota,
                used: 0,
                plan: initialPlan
            }
        });

    } catch (error: any) {
        console.error('--- REGISTRATION API CRASH ---');
        // Log the step where the failure occurred for easier debugging.
        console.error(`Failed at step: ${step}`); 
        // Create a safe version of the request body that excludes the password for logging.
        const safeBody = { ...req.body };
        delete safeBody.password;
        console.error('Safe Request Body:', safeBody);
        console.error('Error Message:', error.message);
        // We can log the stack for more detail in Vercel logs.
        console.error('Stack:', error.stack);
        
        return res.status(500).json({ error: error.message || 'Registration failed due to an internal server error.' });
    }
}