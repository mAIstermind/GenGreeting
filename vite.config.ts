
# AI Greetings - User Guide

## 1. Introduction

Welcome to AI Greetings! This guide will walk you through everything you need to know to create stunning, personalized AI-powered greeting cards in just a few clicks. Whether you're reaching out to clients, inviting guests to an event, or sending holiday wishes, AI Greetings makes it fast, easy, and impactful.

## 2. Core Features

*   **Batch Generation via CSV:** Upload a list of contacts and generate a unique card for each person.
*   **Single Image Generation:** Create a high-quality, one-off image from a simple text description using Imagen.
*   **Image Editing:** Fine-tune your generated cards with text-based editing commands.
*   **Custom Branding (Pro Feature):** Add your personal or business logo and name as a subtle watermark to your cards.
*   **Visual Theme Previews:** See a preview of each image style before you generate, helping you choose the perfect look.

## 3. Getting Started: A Step-by-Step Guide

The application has two main tabs for generating images. Let's explore both.

### 3.1. Generating Cards in Bulk ("Batch Generate via CSV")

This is the perfect tool for creating personalized cards for your entire contact list at once.

**Step 1: Prepare Your CSV File**
Create a CSV file with at least one column: `name`. You can also include a second, optional column containing a public URL to a profile picture or logo for each contact.

*   **Required Column:** A column with the header `name` (or similar, you will map this in the app).
*   **Optional Column:** A column with a header like `imageUrl` containing a full, publicly accessible URL to a JPG or PNG image.

**Step 2: Upload Your File**
On the "Batch Generate via CSV" tab, click the upload area or drag-and-drop your prepared CSV file into it.

**Step 3: Map Your Columns**
The app will ask you to confirm which column from your file to use.
*   Under **Contact Name**, select the column from your file that holds the names. This is required.
*   Under **Profile/Logo Image URL**, you can optionally select the column that contains direct links to images.

**Image URL Guidelines (Important):**
*   The URL must link directly to the image file (ending in `.jpg`, `.jpeg`, or `.png`).
*   The image must be publicly accessible (not behind a login).
*   For best results, use square images.
*   The image file size should be under 4MB.

**Step 4: Choose a Style with Visual Previews**
You'll see a grid of thumbnails, each representing a different visual theme.
*   Click on a thumbnail to select the style you want.
*   You can see a text preview of the prompt below the grid to understand how the AI will interpret the style.

**Step 5: Generate & Download**
Click **"Confirm & Proceed"**. The application will begin generating a unique card for each person. If you provided an image URL for a contact, the AI will intelligently incorporate that image into the final design. Once finished, you can:
*   Download cards one by one using the "Download" button on each card.
*   **(Pro Feature)** Click **"Download All (.zip)"** to save all cards, with your branding applied, in a single file.

### 3.2. Generating a Single Image ("Generate with Imagen")

Use this tab when you only need one high-quality image.

**Step 1: Write Your Prompt**
In the text box, describe the image you want to create. Be as descriptive as possible! For example: *"A photorealistic image of a golden retriever wearing sunglasses on a beach."*

**Step 2: Generate**
Click the **"Generate"** button. The AI will create your image and display it below.

### 3.3. Editing Your Cards

After generating a card, you can fine-tune it.

1.  Hover over any card image and click the **"Edit"** button.
2.  A new window will appear. In the text box, type your edit instruction (e.g., *"Make the background blue"* or *"Add a Santa hat"*).
3.  Click **"Apply Edit"** to see the changes. You can apply multiple edits.
4.  Once you're happy, click **"Save Changes"**.

### 3.4. Managing Your Account & Subscription

**Free Trial:** New users can generate up to 10 cards for free. The number of remaining generations is shown when you open the app.

**Pro Accounts:**
*   **Credit Tracking:** If you have a paid plan, your remaining monthly credits are shown in the header (e.g., "485 / 500 credits left"). This counter resets automatically every month.
*   **Upgrading:** You can click the "Upgrade" button in the header at any time to go to the pricing page and choose a different plan.
*   **Custom Branding:** Click the **user icon** in the top-right corner to open Settings. Here you can enter your name/business name and upload a logo. Your branding will be automatically applied to the corner of every card when you use the **"Download All (.zip)"** function.

## 4. Installing as a Desktop/Mobile App (PWA)

This application is a Progressive Web App (PWA), which means you can install it directly onto your computer or phone for a faster, more integrated experience, just like a native app.

*   **On Desktop (Chrome, Edge):** Look for an "Install" icon in the address bar (usually on the right side, resembling a computer screen with a down arrow). Click it and then confirm the installation. The app will now be in your applications folder and on your taskbar/dock.
*   **On Mobile (iOS/Safari):** Tap the "Share" button at the bottom of the screen, then scroll down and tap "Add to Home Screen".
*   **On Mobile (Android/Chrome):** Tap the three-dot menu in the top-right corner, then tap "Install app" or "Add to Home screen".

This gives you quick, one-click access from your home screen or desktop and provides a focused, full-screen experience without browser tabs.

## 5. Frequently Asked Questions (FAQ)

**Q: What happens if I run out of credits?**
A: The generation features will be disabled. You will see a message prompting you to upgrade your plan to continue creating cards.

**Q: What happens if an image fails to generate for one of my contacts?**
A: The app will continue generating cards for other contacts but will display an error message for the failed ones. This prevents a single bad entry (like a broken image URL) from stopping the entire batch.

**Q: Can I use my own custom prompts for batch generation?**
A: Currently, batch generation uses the provided templates for consistency and quality. For fully custom one-off prompts, please use the "Generate with Imagen" tab.
