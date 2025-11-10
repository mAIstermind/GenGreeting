// /api/register.ts
import { hash } from 'bcryptjs';

// --- START: CONFIGURATION ---

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

// IMPORTANT: These custom field IDs must be set in your Vercel/Netlify environment variables.
const GHL_PASSWORD_FIELD_ID = process.env.GHL_PWA_PASSWORD_FIELD_ID;
const GHL_QUOTA_FIELD_ID = process.env.GHL_PWA_QUOTA_FIELD_ID;
const GHL_USED_FIELD_ID = process.env.GHL_PWA_USED_FIELD_ID;
const GHL_PLAN_FIELD_ID = process.env.GHL_PWA_PLAN_FIELD_ID;

// The specific tag that identifies a user who should get a bonus.
const WEBINAR_ATTENDEE_TAG = 'pwa-webinar-attendee'; 

// --- END: CONFIGURATION ---


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GHL_API_KEY || !GHL_PASSWORD_FIELD_ID || !GHL_QUOTA_FIELD_ID || !GHL_USED_FIELD_ID || !GHL_PLAN_FIELD_ID) {
        console.error("Server configuration error: One or more GHL Custom Field IDs are not set as environment variables.");
        return res.status(500).json({ error: 'Registration service is not configured correctly on the server.' });
    }

    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const ghlHeaders = {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };

        // Step 1: Securely hash the password before storing it.
        const hashedPassword = await hash(password, 10); 

        // Step 2: Check if the contact already exists to determine their bonus status.
        const searchResponse = await fetch(`${GHL_API_URL}lookup?email=${encodeURIComponent(email)}`, { headers: ghlHeaders });
        
        let existingContact = null;
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            existingContact = searchData.contacts?.[0];
        }

        // Step 3: Determine initial quota and plan based on whether they have the webinar tag.
        const isWebinarAttendee = existingContact?.tags?.includes(WEBINAR_ATTENDEE_TAG);
        const initialQuota = isWebinarAttendee ? 50 : 10;
        const initialPlan = isWebinarAttendee ? 'Webinar Free Trial' : 'Free Trial';

        // Step 4: Prepare the contact data, including custom fields.
        const contactData = {
            email: email.toLowerCase(),
            firstName: firstName || '',
            lastName: lastName || '',
            tags: ['pwa-free-trial'], // Add the standard tag for all new signups
            customFields: [
                { id: GHL_PASSWORD_FIELD_ID, field_value: hashedPassword },
                { id: GHL_QUOTA_FIELD_ID, field_value: initialQuota },
                { id: GHL_USED_FIELD_ID, field_value: 0 },
                { id: GHL_PLAN_FIELD_ID, field_value: initialPlan }
            ]
        };

        // Step 5: Use GHL's upsert functionality to create or update the contact.
        // This is more robust as it handles both new registrations and existing contacts
        // who are signing up for the app for the first time.
        const upsertResponse = await fetch(`${GHL_API_URL}upsert`, {
            method: 'POST',
            headers: ghlHeaders,
            body: JSON.stringify(contactData)
        });

        if (!upsertResponse.ok) {
            const errorText = await upsertResponse.text();
            console.error("GHL Upsert Error:", errorText);
            throw new Error(`GHL API Error: Could not create or update contact.`);
        }

        const ghlContactResponse = await upsertResponse.json();
        
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
        console.error('Registration API Error:', error);
        return res.status(500).json({ error: error.message || 'Registration failed due to an internal server error.' });
    }
}