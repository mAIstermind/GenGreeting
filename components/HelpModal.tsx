

import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

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
            <LI><Strong>Step 1: Prepare Your CSV File.</Strong> Create a CSV with at least a <Code>name</Code> column. Optionally, add a second column with a public URL to a logo or profile picture for each person.</LI>
            <LI><Strong>Step 2: Upload Your File.</Strong> On the "Batch Generate via CSV" tab, click or drag-and-drop your prepared CSV file into the upload area.</LI>
            <LI><Strong>Step 3: Map Your Columns.</Strong> Tell the app which column contains names (required). You can also map your optional column containing image URLs.</LI>
            <LI><Strong>Image URL Guidelines:</Strong> The URL must be a direct link to a JPG or PNG image, under 4MB, and publicly accessible. Use square images for best results.</LI>
            <LI><Strong>Step 4: Choose an Image Style.</Strong> Click a thumbnail from the grid to select a visual theme for all your cards.</LI>
            <LI><Strong>Step 5: Generate & Download.</Strong> Click "Confirm & Proceed". If you provided an image URL, the AI will incorporate it. Once done, download cards individually or use "Download All (.zip)" (a Pro feature).</LI>
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
            <LI><Strong>Branding (Pro Feature):</Strong> Click the user icon in the header to open Settings. You can add your name and upload a logo. Your branding can be optionally applied when you use "Download All (.zip)".</LI>
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


export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">User Guide</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close help modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <UserGuide />
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