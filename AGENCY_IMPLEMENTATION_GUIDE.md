# AI Greetings Agency & Implementation Guide

## 1. Introduction for Agencies & Developers

This guide provides a comprehensive walkthrough for deploying, customizing (whitelabeling), and integrating the AI Greetings application into a marketing funnel. It is designed for technical users, such as agency owners or developers, who wish to offer this tool to their clients under their own brand.

## 2. Deployment Guide

Follow these steps to deploy your own instance of the AI Greetings application.

### Prerequisites

*   A hosting provider for static websites (e.g., Vercel, Netlify, AWS S3, or any standard web server).
*   A Google Gemini API Key.

### Step 1: Get the Application Code

You should have a directory containing all the application files (`index.html`, `index.tsx`, `components/`, etc.).

### Step 2: Configure the API Key

The application requires a Google Gemini API key to function. This key must be configured as an **environment variable** in your deployment environment.

*   **Variable Name:** `GEMINI_API_KEY`
*   **Value:** Your Google Gemini API Key.

**How to set environment variables:**
*   **Vercel/Netlify:** Go to your project settings -> Environment Variables.
*   **Other hosts:** Consult your hosting provider's documentation for setting environment variables.

The application's serverless function will automatically and securely pick up this `GEMINI_API_KEY` variable. **Do not hardcode your API key directly into the source code.**

### Step 3: Deploy the Application

Upload all the application files to your chosen hosting provider. Since this is a static React application built with ES modules, there is no complex build step required. Simply serve the `index.html` file and ensure all other files are publicly accessible.

Once deployed, you will have a public URL for your application (e.g., `https://your-app-name.vercel.app`).

## 3. Connecting a Custom Domain (Recommended)

Once your application is deployed, you'll want to serve it from your own domain instead of the default hosting URL. This enhances your brand's professionalism and credibility.

There are several ways to do this, with the **subdomain approach being the highly recommended method** for its simplicity and reliability.

For a detailed comparison of your options and step-by-step instructions, please refer to the dedicated guide:

**[➡️ Read the Custom Domain & Deployment Options Guide](./DEPLOYMENT_OPTIONS.md)**

## 4. Whitelabel Customization

The application is built to be easily rebranded for agency use.

### 4.1. The Branding Mechanism

The application's branding (its name and accent color text) is not hardcoded. It is dynamically loaded from a `<script>` tag within `index.html`. This allows you to change the branding without touching the core application logic.

```html
<!-- Located in index.html -->
<script id="branding-config" type="application/json">
  {
    "appName": "Greetings",
    "appAccent": "AI"
  }
</script>
```

### 4.2. How to Rebrand the Application

1.  Open `index.html` in a text editor.
2.  Locate the `<script id="branding-config">` tag.
3.  Modify the `appName` and `appAccent` values to match your agency or client's brand.
    *   `appAccent` is the colored part of the name (e.g., "AI").
    *   `appName` is the main part of the name (e.g., "Greetings").
    *   The result will be displayed as `<appAccent><appName>`.

**Example:** For a brand called "LeadSpark":
```json
{
  "appName": "Spark",
  "appAccent": "Lead"
}
```

4.  Save the `index.html` file and redeploy the application. The app's header and the browser tab title will now reflect your new branding.

## 5. GoHighLevel (GHL) Funnel Integration

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
3.  Change its link from the placeholder (`#`) to the **public URL of your deployed AI Greetings application** (e.g., `https://gengreeting.yourdomain.com`).

## 6. User Documentation

The project includes a `USER_GUIDE.md` file. This is a comprehensive guide for end-users that you can provide to your clients. You can also use the in-app "Help" modal which displays this guide directly.
