
import React from 'react';

interface FooterProps {
    onPrivacyClick: () => void;
    onTermsClick: () => void;
    onDownloadAppClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPrivacyClick, onTermsClick, onDownloadAppClick }) => {
    return (
        <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                <p>&copy; {new Date().getFullYear()} AI Greetings. All Rights Reserved.</p>
                <div className="flex items-center gap-6 flex-wrap justify-center">
                    <button onClick={onTermsClick} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Terms & Conditions
                    </button>
                    <button onClick={onPrivacyClick} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Privacy Policy
                    </button>
                     <button onClick={onDownloadAppClick} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Download App
                    </button>
                     <a href="https://maistermind.com/gengreeting-affiliate" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Affiliates
                    </a>
                    <a href="https://maistermind.com/gengreeting-agency" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Agency Program
                    </a>
                </div>
            </div>
        </footer>
    );
};
