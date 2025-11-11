import React from 'react';
import type { GeneratedCard } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { EditIcon } from './icons/EditIcon';

interface GreetingCardProps {
  card: GeneratedCard;
  onEdit: (card: GeneratedCard) => void;
  isPreview?: boolean;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({ card, onEdit, isPreview = false }) => {
    
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = card.imageUrl;
    const safeFileName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `greeting_card_${safeFileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300 flex flex-col">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative group">
        <img src={card.imageUrl} alt={`Greeting card for ${card.name}`} className="w-full h-full object-cover" />
        {!isPreview && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <button
                  onClick={() => onEdit(card)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white/80 text-black font-semibold py-2 px-4 rounded-full shadow-md hover:bg-white"
                  aria-label={`Edit greeting card for ${card.name}`}
                  >
                  <EditIcon className="w-5 h-5" />
                  Edit
              </button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="font-semibold text-lg text-gray-800 dark:text-white truncate" title={card.name}>{card.name}</p>
          {card.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={card.email}>
              {card.email}
            </p>
          )}
        </div>
        {!isPreview && (
            <button
                onClick={handleDownload}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
                aria-label={`Download greeting card for ${card.name}`}
                >
                <DownloadIcon className="w-5 h-5"/>
                Download
            </button>
        )}
      </div>
    </div>
  );
};