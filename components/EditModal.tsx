import React, { useState, useEffect } from 'react';
import type { GeneratedCard } from '../types.ts';
import type { GeminiService } from '../services/geminiService.ts';
import { CloseIcon } from './icons/CloseIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

interface EditModalProps {
    card: GeneratedCard;
    onClose: () => void;
    onSave: (updatedCard: GeneratedCard) => void;
    geminiService: GeminiService | null;
}

export const EditModal: React.FC<EditModalProps> = ({ card, onClose, onSave, geminiService }) => {
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

    // Reset state when a new card is passed in
    useEffect(() => {
        setEditedImageUrl(null);
        setEditPrompt('');
        setError(null);
        setIsEditing(false);
    }, [card]);

    const handleEdit = async () => {
        if (!geminiService) {
            setError("API service is not available.");
            return;
        }
        if (!editPrompt.trim()) {
            setError("Please enter an edit instruction.");
            return;
        }
        setIsEditing(true);
        setError(null);
        try {
            const currentImage = editedImageUrl || card.imageUrl;
            const newImageUrl = await geminiService.editGreetingCardImage(currentImage, editPrompt);
            setEditedImageUrl(newImageUrl);
        } catch (e: any) {
            setError(e.message || "Failed to edit image.");
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleSave = () => {
        if (editedImageUrl) {
            onSave({ ...card, imageUrl: editedImageUrl });
        } else {
            onClose(); // Or just close if no edits were made
        }
    };

    const canEdit = geminiService && !isEditing && !!editPrompt;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors z-20"
                    aria-label="Close edit modal"
                >
                    <CloseIcon className="w-8 h-8"/>
                </button>
                
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
                    <img src={editedImageUrl || card.imageUrl} alt={`Editing card for ${card.name}`} className="max-w-full max-h-full object-contain"/>
                     {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                             <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg">Applying edit...</p>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Edit Image</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Describe the change you want to make to the image.</p>

                    <div className="flex-grow space-y-4">
                        <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter' or 'Make the background blue'"
                            className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={isEditing || !geminiService}
                        />

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                         <button onClick={handleSave} className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500">
                            Save Changes
                        </button>
                        <button 
                            onClick={handleEdit} 
                            disabled={!canEdit}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            {isEditing ? 'Applying...' : 'Apply Edit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
