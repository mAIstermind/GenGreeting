# GenGreeting User & Implementation Manual

## 1. Introduction

Welcome to GenGreeting! This application is a powerful tool designed for individuals, businesses, and marketing agencies to generate hundreds of hyper-personalized, AI-powered greeting cards in seconds. By uploading a simple CSV contact list, you can create stunning, unique visuals that cut through the noise and make a real impact.

This manual provides a comprehensive guide for deploying, customizing (whitelabeling), and using the GenGreeting application.

## 2. Core Features

*   **Batch Generation via CSV:** Upload a list of contacts and generate a unique card for each person based on a selected prompt template.
*   **Single Image Generation:** Use the power of Google's Imagen model to create high-quality, one-off images from a text prompt.
*   **Image Editing:** Fine-tune generated images with text-based editing commands.
*   **Custom Branding:** (For logged-in users) Add a personal or business logo and name as a subtle watermark on all downloaded cards.
*   **Whitelabel Ready:** The application is built to be easily rebranded for agency use.
*   **GoHighLevel (GHL) Integration:** Includes ready-to-use landing, pricing, and thank you pages to quickly build a marketing funnel.

## 3. Deployment Guide

Follow these steps to deploy your own instance of the GenGreeting application.

### Prerequisites

*   A hosting provider for static websites (e.g., Vercel, Netlify, AWS S3, or any standard web server).
*   A Google Gemini API Key.

### Step 1: Get the Application Code

You should have a directory containing all the application files (`index.html`, `index.tsx`, `components/`, etc.).

### Step 2: Configure the API Key

The application requires a Google Gemini API key to function. This key must be configured as an environment variable in your deployment environment.

*   **Variable Name:** `API_KEY`
*   **Value:** Your Google Gemini API Key.

**How to set environment variables:**
*   **Vercel/Netlify:** Go to your project settings -> Environment Variables.
*   **Other hosts:** Consult your hosting provider's documentation.

The application code will automatically pick up this `API_KEY` variable. **Do not hardcode your API key directly into the source code.**

### Step 3: Deploy the Application

Upload all the application files to your chosen hosting provider. Since this is a static React application built with ES modules, there is no complex build step required. Simply serve the `index.html` file and ensure all other files are accessible.

Once deployed, you will have a public URL for your application (e.g., `https://your-app-name.vercel.app`).

## 4. Whitelabel & Agency Implementation Guide

This section details how to customize the application and integrate it into a marketing funnel, specifically using GoHighLevel (GHL) as an example.

### The Branding Mechanism

The application's branding (its name and accent color text) is not hardcoded. It is dynamically loaded from a `<script>` tag within `index.html`. This allows you to change the branding without touching the core application logic.

```html
<!-- Located in index.html -->
<script id="branding-config" type="application/json">
  {
    "appName": "Greeting",
    "appAccent": "Gen"
  }
</script>
```

### Step 1: Customize the Application Branding

1.  Open `index.html`.
2.  Locate the `<script id="branding-config">` tag.
3.  Modify the `appName` and `appAccent` values to match your agency or client's brand.
    *   `appAccent` is the colored part of the name (e.g., "Gen").
    *   `appName` is the main part of the name (e.g., "Greeting").
    *   The result will be displayed as `<appAccent><appName>`.

**Example:** For a brand called "AgencySpark":
```json
{
  "appName": "Spark",
  "appAccent": "Agency"
}
```

4.  Save `index.html` and redeploy the application. The app's header and the browser tab title will now reflect your new branding.

### Step 2: Set Up Marketing Pages in GoHighLevel

The project includes three pre-built HTML files designed for a GHL funnel:
*   `ghl-landing-page.html`: Your main sales page.
*   `ghl-pricing-page.html`: A page to display different plans.
*   `ghl-thank-you-page.html`: The page users see after signing up.

**Implementation:**
1.  In your GHL account, create a new Funnel or Website.
2.  For each page (Landing, Pricing, Thank You), create a new step in your funnel.
3.  Open the GHL page builder for a step.
4.  Copy the entire content of the corresponding HTML file (e.g., `ghl-landing-page.html`).
5.  In the GHL builder, find an option to add custom HTML/CSS or view the source code, and paste the copied content.
6.  **Crucially, find all comments marked `<!-- NOTE FOR GHL USER: ... -->` and `<!-- WHITELABEL: ... -->`**. These comments guide you on what to customize.
7.  **Replace all placeholder links (`href="#"`)** with your actual GHL form links, popup triggers, checkout pages, or links to other funnel steps.
8.  Use GHL's custom values (e.g., `{{ agency.name }}`) to dynamically insert your agency's information into the pages for a truly whitelabeled experience.

### Step 3: Link the Funnel to Your Deployed App

The final step is to connect your marketing funnel to the actual application.

1.  Navigate to your "Thank You" page in the GHL funnel builder.
2.  Find the "Go to the App" button.
3.  Change its link from the placeholder (`#`) to the public URL of your deployed GenGreeting application (from Deployment Step 3).

## 5. Testing the Whitelabel Setup

Follow these stages to ensure everything is working correctly.

*   **Stage 1: Base Application Test**
    *   Navigate directly to your deployed application URL.
    *   Test both core functions: generate a single image with Imagen and perform a batch generation using a sample CSV file.
    *   Confirm images are generated successfully.

*   **Stage 2: Branding Customization Test**
    *   Modify the `appName` and `appAccent` in `index.html` as described above.
    *   Redeploy the application.
    *   Visit the application URL and verify that the header and browser title show the new branding.

*   **Stage 3: Funnel Integration Test**
    *   Open the live URL of your GHL landing page.
    *   Click through the call-to-action buttons. Ensure they open the correct forms or navigate to the next funnel step.
    *   Complete the sign-up process.
    *   On the "Thank You" page, click the "Go to the App" button.
    *   Confirm that you are correctly redirected to your deployed, whitelabeled application.

## 6. End-User Guide

### Using Batch Generation (CSV)

1.  Select the "Batch Generate via CSV" tab.
2.  Click the upload area or drag-and-drop a CSV file. The CSV must contain columns for contact names and emails.
3.  On the mapping screen, select which column from your CSV corresponds to "Contact Name" and "Contact Email".
4.  Choose an image style from the available "Prompt Templates".
5.  Click "Confirm & Proceed". The app will generate a unique card for each contact.
6.  Once complete, you can download cards individually or use "Download All (.zip)" (requires login).

### Using Imagen Generator

1.  Select the "Generate with Imagen" tab.
2.  Enter a descriptive text prompt in the input field (e.g., "A photo of a Corgi wearing a chef's hat").
3.  Click "Generate".
4.  The generated image will appear below.

### Using Custom Branding (Logged-in Users)

1.  Log in to your account.
2.  Click the "Branding" button in the header.
3.  In the settings modal, enter your name or business name.
4.  Upload a logo/profile photo (PNG, JPG, or WEBP, max 2MB).
5.  Click "Save Settings".
6.  Now, when you click "Download All (.zip)", your saved name and logo will be applied as a watermark to the bottom-right of each card.
