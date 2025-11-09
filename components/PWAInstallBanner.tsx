import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg bg-gray-800 border border-blue-500 text-white p-4 rounded-lg shadow-2xl flex items-center justify-between gap-4 z-50 animate-fade-in-up">
      <div className="flex-grow">
        <p className="font-bold">Get the Full App Experience!</p>
        <p className="text-sm text-gray-300">Install AI Greetings on your device for quick access.</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onInstall}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          Install
        </button>
        <button
          onClick={onDismiss}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
          aria-label="Dismiss install promotion"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};