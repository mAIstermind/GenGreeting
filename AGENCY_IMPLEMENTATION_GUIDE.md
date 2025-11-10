# AI Greetings Agency & Implementation Guide

## 1. Introduction for Agencies & Developers

This guide provides a comprehensive walkthrough for deploying, customizing (whitelabeling), and integrating the AI Greetings application into a marketing funnel. It is designed for technical users, such as agency owners or developers, who wish to offer this tool to their clients under their own brand.

## 2. Deployment Guide

Follow these steps to deploy your own instance of the AI Greetings application.

### Prerequisites

*   A hosting provider for static websites with serverless function support (e.g., Vercel, Netlify).
*   A Google Gemini API Key.
*   A GoHighLevel (GHL) account with API access.

### Step 1: Get the Application Code

You should have a directory containing all the application files (`index.html`, `index.tsx`, `api/`, etc.).

### Step 2: Deploy the Application

Upload all the application files to your chosen hosting provider (Vercel is recommended). Since this is a static React application with a serverless function, the host will handle the setup. Simply import your project from your Git repository.

Once deployed, you will have a public URL for your application (e.g., `https://your-app-name.vercel.app`).

### Step 3: Configure Environment Variables (Crucial)

Your application will not work until you configure its security keys and API keys in your hosting provider's settings.

*   **Vercel/Netlify:** Go to your project settings -> Environment Variables.
*   **Add the following variables:**

| Variable Name           | Description                                                                                             | Example Value                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `GEMINI_API_KEY`        | Your Google Gemini API Key.                                                                             | `AIzaSy...`                           |
| `GHL_API_KEY`           | Your GoHighLevel API Key (find it in your GHL account settings).                                        | `ey...`                               |
| `GHL_PASSWORD_FIELD_ID` | The ID of the GHL custom field you create for storing user passwords (see Section 5 for instructions).  | `z8y...`                              |
| `JWT_SECRET`            | A long, random, secret string used to sign user session tokens. Use a password generator to create this. | `a_very_long_random_secure_string_!@#` |

## 3. Connecting a Custom Domain (Recommended)

Once your application is deployed, you'll want to serve it from your own domain instead of the default hosting URL. This enhances your brand's professionalism and credibility.

For a detailed comparison of your options and step-by-step instructions, please refer to the dedicated guide:

**[➡️ Read the Custom Domain & Deployment Options Guide](./DEPLOYMENT_OPTIONS.md)**

## 4. Whitelabel Customization

The application is built to be easily rebranded for agency use. To access the customization dashboard, add `?view=agency` to your deployed application's URL (e.g., `https://gengreeting.yourdomain.com/?view=agency`). The default password is `admin123`.

### 4.1. Branding & API

*   **App Name & Logo:** Set your application's name, accent color, and logo.
*   **API Configuration (Optional):** You can enter a Gemini API key here that will be used *only for your clients*. This allows you to bill clients for usage separately from your main account. If left blank, it defaults to the `GEMINI_API_KEY` you set in your environment variables.
*   **Plan Configuration:** Set the names and monthly credit limits for the subscription tiers you will offer to your clients.

### 4.2. Legal & Compliance Configuration (Important)

As you are providing this application as a service to your end-users, you are responsible for providing your own legal documents.

*   Go to the "Legal & Compliance" section in the Agency Dashboard.
*   Paste your company's Privacy Policy and Terms & Conditions into the provided fields.

The content you save here will be displayed to your end-users when they click the corresponding links in the application's footer.

## 5. Authentication Setup (GHL Integration)

This application uses GHL as its user database. When a user registers, a new Contact is created in your GHL account. To make this work, you must create a custom field in GHL to store the user's (hashed) password.

### Step 1: Create a Custom Field in GHL
1.  In your GHL account, go to **Settings** -> **Custom Fields**.
2.  Click **"Add Field"**.
3.  Choose the **"Text"** field type.
4.  **Field Name:** Give it a clear name, like `App Password`.
5.  **Placeholder:** You can write something like `Do not edit this field`.
6.  Click **"Save"**.

### Step 2: Get the Custom Field ID
1.  After saving, find the new custom field you just created in the list.
2.  Look for the **"Key"** value. It will look something like `app_password` or a random string.
3.  **This is your Field ID.** Copy it.

### Step 3: Set Your Environment Variables
1.  Go back to your hosting provider (Vercel/Netlify).
2.  Set the `GHL_PASSWORD_FIELD_ID` environment variable to the **Key** you just copied from GHL.
3.  Ensure your `GHL_API_KEY` and `JWT_SECRET` are also set correctly as described in Section 2.

Your authentication system is now fully configured.

## 6. GoHighLevel (GHL) Funnel Integration

The project includes pre-built HTML files designed for a GHL funnel:
*   `ghl-landing-page.html`: Your main sales page.
*   `ghl-pricing-page.html`: A page to display different plans.
*   `ghl-thank-you-page.html`: The page users see after signing up.

### Implementation Steps

1.  In your GHL account, create a new Funnel.
2.  For each page (Landing, Pricing, Thank You), create a new step in your funnel.
3.  Open the GHL page builder for a step, and add a custom HTML/CSS block.
4.  Copy the entire content of the corresponding HTML file (e.g., `ghl-landing-page.html`) and paste it into the block.
5.  **Crucially, find all comments marked `<!-- NOTE FOR GHL USER: ... -->`**. These comments guide you on what to customize.
6.  **Replace all placeholder links (`href="#"`)** with your actual GHL form links, popup triggers, checkout pages, etc.

### Linking the Funnel to Your App

1.  Navigate to your **"Thank You"** page in the GHL funnel builder.
2.  Find the "Go to the App" button.
3.  Change its link from the placeholder (`#`) to the **public URL of your deployed AI Greetings application** (e.g., `https://gengreeting.yourdomain.com`).
