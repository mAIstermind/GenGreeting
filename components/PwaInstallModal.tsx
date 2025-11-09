
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface PwaInstallModalProps {
    onClose: () => void;
}

const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold text-blue-400 mt-6 mb-2">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="leading-relaxed">{children}</p>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 pl-4">{children}</ul>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;


export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Install the App</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close install guide modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300 space-y-4">
                    <P>This application is a Progressive Web App (PWA), which means you can install it directly onto your computer or phone for a faster, more integrated experience, just like a native app.</P>
                    <P>This gives you quick, one-click access and a focused, full-screen experience.</P>

                    <H3>On Desktop (Chrome, Edge)</H3>
                    <UL>
                        <LI>Look for an "Install" icon in the address bar (usually on the right side, it might look like a computer screen with a downward arrow).</LI>
                        <LI>Click it and then confirm the installation.</LI>
                    </UL>

                    <H3>On Mobile (iOS/Safari)</H3>
                    <UL>
                        <LI>Tap the "Share" button in the browser toolbar (a square with an upward arrow).</LI>
                        <LI>Scroll down the share sheet and tap "Add to Home Screen".</LI>
                    </UL>
                    
                     <H3>On Mobile (Android/Chrome)</H3>
                    <UL>
                        <LI>Tap the three-dot menu icon in the top-right corner of the browser.</LI>
                        <LI>Tap "Install app" or "Add to Home screen".</LI>
                    </UL>
                </div>

                 <div className="p-4 flex justify-end gap-4 border-t border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};
