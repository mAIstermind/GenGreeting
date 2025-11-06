# GenGreeting Agency & Implementation Guide

## 1. Introduction for Agencies & Developers

This guide provides a comprehensive walkthrough for deploying, customizing (whitelabeling), and integrating the GenGreeting application into a marketing funnel. It is designed for technical users, such as agency owners or developers, who wish to offer this tool to their clients under their own brand.

## 2. Deployment Guide

Follow these steps to deploy your own instance of the GenGreeting application.

### Prerequisites

*   A hosting provider for static websites (e.g., Vercel, Netlify, AWS S3, or any standard web server).
*   A Google Gemini API Key.

### Step 1: Get the Application Code

You should have a directory containing all the application files (`index.html`, `index.tsx`, `components/`, etc.).

### Step 2: Configure the API Key

The application requires a Google Gemini API key to function. This key must be configured as an **environment variable** in your deployment environment.

*   **Variable Name:** `API_KEY`
*   **Value:** Your Google Gemini API Key.

**How to set environment variables:**
*   **Vercel/Netlify:** Go to your project settings -> Environment Variables.
*   **Other hosts:** Consult your hosting provider's documentation for setting environment variables.

The application code will automatically and securely pick up this `API_KEY` variable. **Do not hardcode your API key directly into the source code.**

### Step 3: Deploy the Application

Upload all the application files to your chosen hosting provider. Since this is a static React application built with ES modules, there is no complex build step required. Simply serve the `index.html` file and ensure all other files are publicly accessible.

Once deployed, you will have a public URL for your application (e.g., `https://your-app-name.vercel.app`).

## 3. Whitelabel Customization

The application is built to be easily rebranded for agency use.

### 3.1. The Branding Mechanism

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

### 3.2. How to Rebrand the Application

1.  Open `index.html` in a text editor.
2.  Locate the `<script id="branding-config">` tag.
3.  Modify the `appName` and `appAccent` values to match your agency or client's brand.
    *   `appAccent` is the colored part of the name (e.g., "Gen").
    *   `appName` is the main part of the name (e.g., "Greeting").
    *   The result will be displayed as `<appAccent><appName>`.

**Example:** For a brand called "LeadSpark":
```json
{
  "appName": "Spark",
  "appAccent": "Lead"
}
```

4.  Save the `index.html` file and redeploy the application. The app's header and the browser tab title will now reflect your new branding.

## 4. GoHighLevel (GHL) Funnel Integration

The project includes three pre-built HTML files designed for a GHL funnel:
*   `ghl-landing-page.html`: Your main sales page.
*   `ghl-pricing-page.html`: A page to display different plans.
*   `ghl-thank-you-page.html`: The page users see after signing up.

### Implementation Steps

1.  In your GHL account, create a new Funnel or Website.
2.  For each page (Landing, Pricing, Thank You), create a new step in your funnel.
3.  Open the GHL page builder for a step.
4.  Copy the entire content of the corresponding HTML file (e.g., `ghl-landing-page.html`).
5.  In the GHL builder, find an option to add custom HTML/CSS or view the source code, and paste the copied content.
6.  **Crucially, find all comments marked `<!-- NOTE FOR GHL USER: ... -->` and `<!-- WHITELABEL: ... -->`**. These comments guide you on what to customize.
7.  **Replace all placeholder links (`href="#"`)** with your actual GHL form links, popup triggers, checkout pages, or links to other funnel steps.
8.  Use GHL's custom values (e.g., `{{ agency.name }}`) to dynamically insert your agency's information into the pages for a truly whitelabeled experience.

### Linking the Funnel to Your App

The final and most important step is to connect your marketing funnel to the actual application.

1.  Navigate to your **"Thank You"** page in the GHL funnel builder.
2.  Find the "Go to the App" button.
3.  Change its link from the placeholder (`#`) to the **public URL of your deployed GenGreeting application** (from Deployment Step 3).

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
    *   Complete a test sign-up.
    *   On the "Thank You" page, click the "Go to the App" button.
    *   Confirm that you are correctly redirected to your deployed, whitelabeled application.
