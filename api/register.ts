// /api/register.ts

import { hash } from 'bcryptjs';

// Base URL for your GHL sub-account API (find this in your GHL settings)
const GHL_API_URL = 'https://api.msgsndr.com/v1/contacts/';
const GHL_API_KEY = process.env.GHL_API_KEY; // The secure variable from Vercel

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password.' });
    }

    try {
        // --- A. Hash the Password ---
        // Securely hash the password for storage in the GHL custom field
        const hashedPassword = await hash(password, 10); 

        // --- B. Prepare Custom Fields and Tags ---
        
        // --- 1. First, check if the contact already exists via GHL API ---
        // We do this to check for the 'pwa-webinar-attendee' tag before creating the user.
        const searchResponse = await fetch(`${GHL_API_URL}/search/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const searchData = await searchResponse.json();
        const existingContact = searchData.contacts ? searchData.contacts[0] : null;
        
        // Check for webinar tag
        const isWebinarAttendee = existingContact && existingContact.tags.includes('pwa-webinar-attendee');
        const initialQuota = isWebinarAttendee ? 50 : 10;
        const initialPlan = isWebinarAttendee ? 'Webinar Free Trial' : 'Free Trial';

        // Custom fields array
        const customFields = [
            { id: 'pwa_password_hash', value: hashedPassword },
            { id: 'pwa_monthly_quota', value: initialQuota },
            { id: 'pwa_credits_used', value: 0 },
            { id: 'pwa_current_plan', value: initialPlan }
            // Note: pwa_renewal_date will be set by the GHL workflow
        ];

        // --- C. Call GHL Create/Update Contact Endpoint ---
        
        const createUpdateResponse = await fetch(GHL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                firstName,
                lastName,
                tags: ['pwa-free-trial'],
                customField: customFields
            })
        });

        if (!createUpdateResponse.ok) {
            const errorText = await createUpdateResponse.text();
            throw new Error(`GHL API Error: ${errorText}`);
        }

        const ghlContact = await createUpdateResponse.json();
        
        return res.status(200).json({ 
            success: true, 
            message: 'Registration successful. Credits granted.', 
            quota: initialQuota 
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ error: 'Registration failed due to server error.' });
    }
}