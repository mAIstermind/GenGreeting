import React, { useState } from 'react';
import type { GeminiService } from '../services/geminiService.ts';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

interface ImageGeneratorProps {
    geminiService: GeminiService | null;
    isOnline: boolean;
    remainingCredits: number;
    onGenerationComplete: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ geminiService, isOnline, remainingCredits, onGenerationComplete }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !geminiService) return;

        if (!isOnline) {
            setError("You are offline. Please reconnect to generate images.");
            return;
        }
        
        if (remainingCredits <= 0) {
            setError("You have no remaining credits for this cycle. Please upgrade your plan.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const result = await geminiService.generateImageWithImagen(prompt);
            setImageUrl(result);
            onGenerationComplete();
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        const safeFileName = prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `imagen_card_${safeFileName || 'generated'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const canGenerate = geminiService && !isLoading && !!prompt.trim() && isOnline && remainingCredits > 0;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleGenerate}>
                    <div className="flex justify-between items-center">
                        <label htmlFor="image-prompt" className="block text-lg font-medium text-gray-800 dark:text-gray-200">
                            Enter your image prompt
                        </label>
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                            {remainingCredits} credits remaining
                        </p>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row gap-3">
                        <input
                            id="image-prompt"
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A robot holding a red skateboard'"
                            className="flex-grow w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading || !geminiService || !isOnline}
                        />
                        <button
                            type="submit"
                            disabled={!canGenerate}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <SparklesIcon className="h-5 w-5 mr-2 -ml-1" />
                            {isLoading ? 'Generating...' : 'Generate (1 credit)'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                {isLoading && (
                     <div className="text-center" role="status">
                        <div className="flex justify-center items-center">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4">Creating your image with Imagen...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/50 dark:border-red-500 dark:text-red-300" role="alert">
                        <strong className="font-bold">Generation Failed: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {imageUrl && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 aspect-square max-w-lg w-full">
                            <img src={imageUrl} alt={prompt} className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                            aria-label="Download generated image"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Download Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
