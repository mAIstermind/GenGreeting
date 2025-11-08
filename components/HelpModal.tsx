import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon.tsx';

interface HelpModalProps {
    onClose: () => void;
}

const GuideContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300 space-y-4">
        {children}
    </div>
);
const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold text-blue-400 mt-6 mb-2">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="leading-relaxed">{children}</p>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 pl-4">{children}</ul>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-gray-700 text-sm text-yellow-300 rounded-md px-2 py-1 font-mono">{children}</code>;


const UserGuide = () => (
    <GuideContent>
        <H2>User Guide</H2>
        <H3>1. Introduction</H3>
        <P>Welcome! This guide walks you through creating stunning, personalized AI-powered greeting cards in just a few clicks. Whether you're reaching out to clients, inviting guests, or sending holiday wishes, this tool makes it fast, easy, and impactful.</P>

        <H3>2. Generating Cards in Bulk (via CSV)</H3>
        <P>This is the perfect tool for creating personalized cards for your entire contact list at once.</P>
        <UL>
            <LI><Strong>Step 1: Prepare Your CSV File.</Strong> Create a CSV file with columns for names and emails. You can also include other columns for more detailed personalization, like "Job Title", "Hobby", or "City".</LI>
            <LI><Strong>Step 2: Upload Your File.</Strong> On the "Batch Generate via CSV" tab, click or drag-and-drop your prepared CSV file into the upload area.</LI>
            <LI><Strong>Step 3: Map Your Columns.</Strong> Tell the app which column contains names and which contains emails by selecting them from the dropdowns.</LI>
            <LI><Strong>Step 4 (Optional): Add Theme Customization.</Strong> Use the "Theme Customization" dropdown to select another column from your CSV. This adds extra detail to each card. For example, if you have a "Hobby" column, the AI will incorporate each person's hobby into their unique image.</LI>
            <LI><Strong>Step 5: Choose a Style with Visual Previews.</Strong> Instead of a list, you'll see a grid of thumbnails. Click a thumbnail to select that style. A text preview of the prompt will appear below the grid.</LI>
            <LI><Strong>Step 6: Generate & Download.</Strong> Click "Confirm & Proceed". Once finished, download cards one by one, or use "Download All (.zip)" (Pro feature).</LI>
        </UL>

        <H3>3. Generating a Single Image (with Imagen)</H3>
        <P>Use this tab when you only need one high-quality image.</P>
         <UL>
            <LI><Strong>Step 1: Write Your Prompt.</Strong> In the text box, describe the image you want. Be descriptive! For example: <Code>"A photorealistic image of a golden retriever wearing sunglasses on a beach."</Code></LI>
            <LI><Strong>Step 2: Generate.</Strong> Click the "Generate" button.</LI>
        </UL>

        <H3>4. Editing & Branding</H3>
         <UL>
            <LI><Strong>Editing:</Strong> Hover over any card image and click the "Edit" button. Type your instruction (e.g., <Code>"Make the background blue"</Code>) and click "Apply Edit".</LI>
            <LI><Strong>Branding (Pro Feature):</Strong> Click the user icon in the header to open Settings. You can add your name and upload a logo. Your branding will be automatically applied when you use "Download All (.zip)".</LI>
        </UL>
        
        <H3>5. Installing as a Desktop/Mobile App (PWA)</H3>
        <P>This application is a Progressive Web App (PWA), which means you can install it directly onto your computer or phone for a faster, more integrated experience, just like a native app.</P>
        <UL>
            <LI><Strong>On Desktop (Chrome, Edge):</Strong> Look for an "Install" icon in the address bar (usually on the right side). Click it and then confirm the installation.</LI>
            <LI><Strong>On Mobile (iOS/Safari):</Strong> Tap the "Share" button, then scroll down and tap "Add to Home Screen".</LI>
            <LI><Strong>On Mobile (Android/Chrome):</Strong> Tap the three-dot menu, then tap "Install app" or "Add to Home screen".</LI>
        </UL>
        <P>This gives you quick, one-click access and a focused, full-screen experience.</P>
    </GuideContent>
);

const AgencyGuide = () => (
     <GuideContent>
        <H2>Agency & Implementation Guide</H2>
        <H3>1. Deployment</H3>
        <P>Follow these steps to deploy your own instance of the application.</P>
        <UL>
            <LI><Strong>Prerequisites:</Strong> A static website host (Vercel, Netlify) and a Google Gemini API Key.</LI>
            <LI><Strong>API Key Config:</Strong> The Gemini API key must be set as an environment variable named <Code>GEMINI_API_KEY</Code> in your hosting provider's settings. Do not hardcode the key.</LI>
            <LI><Strong>Deployment:</Strong> Upload all application files to your host. Since it's a static app, no build step is needed. Just serve the <Code>index.html</Code> file.</LI>
        </UL>

        <H3>2. Connecting a Custom Domain (Recommended)</H3>
        <P>Once deployed, serve the app from your own domain. The <Strong>subdomain approach</Strong> (e.g., <Code>app.yourdomain.com</Code>) is highly recommended for its simplicity and reliability.</P>
        <P>For detailed instructions, please refer to the <Code>DEPLOYMENT_OPTIONS.md</Code> file included in the project source code.</P>

        <H3>3. Whitelabel Customization</H3>
        <P>Easily rebrand the application for your agency.</P>
         <UL>
            <LI><Strong>How it Works:</Strong> The app's name is loaded from a <Code>&lt;script&gt;</Code> tag in <Code>index.html</Code>.</LI>
            <LI><Strong>How to Rebrand:</Strong>
                <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                    <li>Open <Code>index.html</Code>.</li>
                    <li>Find the <Code>&lt;script id="branding-config"&gt;</Code> tag.</li>
                    <li>Change the <Code>appName</Code> and <Code>appAccent</Code> values to your brand.</li>
                    <li>Save and redeploy.</li>
                </ol>
            </LI>
        </UL>
        
        <H3>4. GHL Funnel Integration</H3>
        <P>The project includes three pre-built HTML files for a GHL funnel: <Code>ghl-landing-page.html</Code>, <Code>ghl-pricing-page.html</Code>, and <Code>ghl-thank-you-page.html</Code>. These are for your end-users.</P>
        <UL>
            <LI><Strong>Implementation:</Strong> In your GHL funnel builder, copy the content from the HTML files into custom HTML blocks on each respective page.</LI>
            <LI><Strong>Crucial:</Strong> Find all comments marked <Code>&lt;!-- NOTE FOR GHL USER: ... --&gt;</Code> and replace placeholder links (<Code>href="#"</Code>) with your actual GHL form links, checkout pages, etc.</LI>
            <LI><Strong>Link Your App:</Strong> On the "Thank You" page in GHL, edit the "Go to the App" button to link to the public URL of your deployed application.</LI>
        </UL>

        <H3>5. Agency Whitelabel Sales Pages</H3>
        <P>This project also includes pre-built HTML templates for selling this entire application to other agencies. You can view them here. These are designed to be imported into your own marketing platform (like GHL).</P>
        <UL>
            <LI><a href="/agency-sales-page.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Sales Page</a></LI>
            <LI><a href="/agency-pricing-page.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Pricing Page</a></LI>
            <LI><a href="/agency-onboarding-thank-you.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Onboarding Page</a></LI>
        </UL>
    </GuideContent>
);

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('user');

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Help & Guides</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close help modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="border-b border-gray-700 px-6 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'user' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            End-User Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('agency')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'agency' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            For Agencies / Developers
                        </button>
                    </nav>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'user' ? <UserGuide /> : <AgencyGuide />}
                </div>

                 <div className="p-4 flex justify-end gap-4 border-t border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};