
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  'Warming up the AI...',
  'Mixing digital colors...',
  'Finding inspiration...',
  'Painting with pixels...',
  'Adding the final touches...',
  'Almost there...',
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{animationDelay: '0.2s'}}></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{animationDelay: '0.4s'}}></div>
      <span className="ml-2 text-white">{message}</span>
    </div>
  );
};
