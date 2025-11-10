// /api/ghl-webhook.ts

// This serverless function is designed to be called by an automation tool like Make.com
// after a successful payment is processed. It checks if the paying user is eligible for
// a lifetime bonus (based on a GHL tag) and applies it to their account.

// --- START: CONFIGURATION ---

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

// IMPORTANT: These custom field IDs must be set in your Vercel/Netlify environment variables.
// These variables have been aligned with the documentation to remove the `_PWA_` prefix.
const GHL_QUOTA_FIELD_ID = process.env.GHL_QUOTA_FIELD_ID;
const GHL_PLAN_FIELD_ID = process.env.GHL_PLAN_FIELD_ID;

// The specific tag that identifies a user who attended the webinar and is eligible for the bonus.
const WEBINAR_ATTENDEE_TAG = 'pwa-webinar-attendee';
// The new tag to apply to users who have received the bonus.
const WEBINAR_BONUS_TAG = 'pwa-webinar-bonus-partner';

// The number of bonus credits to add.
const LIFETIME_BONUS_CREDITS = 1000;

// --- END: CONFIGURATION ---


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Validate server configuration
    if (!GHL_API_KEY || !GHL_QUOTA_FIELD_ID || !GHL_PLAN_FIELD_ID) {
        console.error("Server configuration error: GHL_API_KEY or one or more GHL Custom Field IDs are missing.");
        return res.status(500).json({ error: 'Webhook service is not configured correctly on the server.' });
    }

    // Expecting email and the base plan quota from the webhook payload (e.g., from Make.com)
    const { email, baseQuota } = req.body;
    
    if (!email || baseQuota === undefined) {
        return res.status(400).json({ error: 'Missing or invalid "email" or "baseQuota" in the request body.' });
    }
    
    const numericBaseQuota = Number(baseQuota);
    if (isNaN(numericBaseQuota)) {
        return res.status(400).json({ error: '"baseQuota" must be a valid number.' });
    }

    try {
        const ghlHeaders = {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        };

        // Step 1: Find the contact in GHL by email to get their ID and existing tags.
        const lookupResponse = await fetch(`${GHL_API_URL}lookup?email=${encodeURIComponent(email)}`, { headers: ghlHeaders });

        if (!lookupResponse.ok) {
            const errorBody = await lookupResponse.text();
            console.warn(`Webhook: Could not find GHL contact for email ${email}. Error: ${errorBody}`);
            // If contact doesn't exist, we can't apply a bonus. This is not a server error.
            return res.status(200).json({ success: true, message: 'Contact not found, no bonus applied.' });
        }
        
        const lookupData = await lookupResponse.json();
        const contact = lookupData.contacts?.[0];

        if (!contact) {
            return res.status(200).json({ success: true, message: 'Contact not found, no bonus applied.' });
        }

        // Step 2: Check if the contact has the required webinar attendee tag.
        const isWebinarAttendee = contact.tags?.includes(WEBINAR_ATTENDEE_TAG);

        if (!isWebinarAttendee) {
            // If the contact wasn't a webinar attendee, no bonus is applied. This is an expected outcome.
            return res.status(200).json({ success: true, message: 'Bonus not applicable for this contact.' });
        }
        
        // Step 3: Calculate the new quota and prepare the update payload.
        const lifetimeBonusQuota = numericBaseQuota + LIFETIME_BONUS_CREDITS;
        
        // Ensure we don't duplicate tags.
        const existingTags = new Set(contact.tags || []);
        existingTags.add(WEBINAR_BONUS_TAG);

        const updatePayload = {
            tags: Array.from(existingTags),
            customFields: [
                { id: GHL_QUOTA_FIELD_ID, value: lifetimeBonusQuota },
                { id: GHL_PLAN_FIELD_ID, value: 'Paid Plan + Lifetime Bonus' }
            ]
        };

        // Step 4: Update the contact in GHL with the new quota and tag.
        const updateResponse = await fetch(`${GHL_API_URL}${contact.id}`, {
            method: 'PUT',
            headers: ghlHeaders,
            body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
            const errorBody = await updateResponse.text();
            console.error(`Webhook: GHL contact update failed for contact ID ${contact.id}. Error: ${errorBody}`);
            throw new Error('Failed to update contact in the CRM.');
        }

        return res.status(200).json({ success: true, message: 'Lifetime bonus applied successfully.' });

    } catch (error: any) {
        console.error('GHL Webhook Error:', error);
        return res.status(500).json({ error: 'An internal server error occurred during bonus application.' });
    }
}