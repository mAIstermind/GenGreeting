
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-white"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{animationDelay: '0.2s'}}></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-white" style={{animationDelay: '0.4s'}}></div>
      <span className="ml-2 text-white">Generating...</span>
    </div>
  );
};
