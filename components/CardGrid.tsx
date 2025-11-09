
import React, { useState } from 'react';
import type { GeneratedCard } from '../types.ts';
import { GreetingCard } from './GreetingCard.tsx';
import { RefreshIcon } from './icons/RefreshIcon.tsx';
import { ZipIcon } from './icons/ZipIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { Loader } from './Loader.tsx';
import { ProgressBar } from './ProgressBar.tsx';

interface CardGridProps {
  cards: GeneratedCard[];
  onEditCard: (card: GeneratedCard) => void;
  onDownloadAll: (applyBranding: boolean) => void;
  onReset: () => void;
  isBranding: boolean;
  brandingProgress: number;
  brandName: string;
  brandLogo: string | null;
  isLoggedIn: boolean;
  isOnline: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({ 
    cards, 
    onEditCard,
    onDownloadAll,
    onReset,
    isBranding,
    brandingProgress,
    brandName,
    brandLogo,
    isLoggedIn,
    isOnline
 }) => {
  const [applyBranding, setApplyBranding] = useState(true);
  const canBrand = (brandName || brandLogo) && isLoggedIn;

  if (cards.length === 0) {
    return (
        <div className="text-center text-gray-400 py-10">
            <h2 className="text-2xl font-bold text-white mb-2">No Cards Generated Yet</h2>
            <p>Once you generate cards, they will appear here.</p>
        </div>
    );
  }

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">Your Cards Are Ready!</h2>
            <div className="flex items-stretch gap-2 flex-col sm:flex-row w-full sm:w-auto">
                <div className="flex flex-col items-center gap-2">
                    <button onClick={() => onDownloadAll(applyBranding && canBrand)} disabled={isBranding || !isOnline} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                    {isBranding ? <Loader/> : <><ZipIcon className="w-5 h-5" /> Download All (.zip)</>}
                    </button>
                    {canBrand && (
                        <div className="flex items-center gap-2">
                             <label htmlFor="branding-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="branding-toggle" className="sr-only" checked={applyBranding} onChange={() => setApplyBranding(!applyBranding)} />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${applyBranding ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${applyBranding ? 'transform translate-x-full' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-xs text-gray-300">
                                    Apply custom branding (1 credit/card)
                                </div>
                            </label>
                        </div>
                    )}
                </div>
                <button onClick={onReset} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600">
                    <RefreshIcon className="w-5 h-5" /> Start Over
                </button>
            </div>
        </div>
        {isBranding && (
            <div className="my-4">
                <p className="text-center text-white mb-2">Applying branding and zipping files...</p>
                <ProgressBar progress={brandingProgress} />
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
            // FIX: Changed card.email to card.name because 'email' does not exist on the GeneratedCard type.
            <GreetingCard key={`${card.name}-${index}`} card={card} onEdit={onEditCard}/>
        ))}
        </div>
    </>
  );
};
