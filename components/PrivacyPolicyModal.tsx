
import React from 'react';
import { CloseIcon } from './icons/CloseIcon.tsx';

interface ModalProps {
    onClose: () => void;
    customContent?: string;
}

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold text-blue-400 mt-6 mb-2">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="leading-relaxed">{children}</p>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 pl-4">{children}</ul>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;


const DefaultPrivacyPolicy = () => (
    <>
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <H3>1. Our Commitment to Your Privacy</H3>
        <P>This application is designed with your privacy as a top priority. We are committed to processing the absolute minimum amount of data required to provide our service, and we do not store your sensitive information.</P>
        
        <H3>2. Data We Process</H3>
        <P>When you use our services, we process the following data on a temporary, in-memory basis to fulfill your requests:</P>
        <UL>
            <LI><Strong>CSV File Content:</Strong> The data contained within the CSV files you upload (such as names and image URLs) is read into the application's memory for the sole purpose of generating the greeting cards. This data is processed in real-time and is never written to disk or stored in any database on our servers.</LI>
            <LI><Strong>Uploaded Image URLs:</Strong> When you provide an image URL in your CSV, our server temporarily fetches this image to pass it to the AI model for generation. The image itself is not stored.</LI>
        </UL>
        <P>Once your generation request is complete and the browser session ends, this information is discarded.</P>

        <H3>3. Data We DO NOT Store</H3>
        <P>We want to be explicitly clear about what we do not do:</P>
        <UL>
            <LI>We <Strong>do not</Strong> save, store, or log the contents of your uploaded CSV files.</LI>
            <LI>We <Strong>do not</Strong> store the images generated for you.</LI>
            <LI>We <Strong>do not</Strong> store the profile pictures or logos fetched from the URLs in your CSV.</LI>
        </UL>
        <P>Your contact lists and the content you create are yours alone. They are not used for any other purpose, such as training AI models or marketing.</P>

        <H3>4. Data Shared with Third Parties</H3>
        <P>To generate the images, the data you provide (e.g., name, prompt text, and images from URLs) is sent to the Google Gemini API. We recommend you review Google's API policies for information on how they handle data. We do not share your data with any other third parties.</P>
        
        <H3>5. Changes to This Policy</H3>
        <P>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</P>
    </>
);

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ onClose, customContent }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300 space-y-4">
                   {customContent ? (
                        <pre className="whitespace-pre-wrap font-sans text-gray-300 text-base">{customContent}</pre>
                   ) : (
                        <DefaultPrivacyPolicy />
                   )}
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
