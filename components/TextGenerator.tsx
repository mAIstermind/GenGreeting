

import React, { useState, useRef, useCallback } from 'react';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import type { Contact } from '../types';

interface TextGeneratorProps {
    onGenerate: (contacts: Contact[], promptTemplate: string) => void;
    isOnline: boolean;
    remainingCredits: number;
}

interface Row {
  id: number;
  name: string;
  imageUrl: string; // For URL input
  imageFile: File | null;
  imagePreview: string | null;
  incorporateImage: boolean;
  error: string | null;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const TextGenerator: React.FC<TextGeneratorProps> = ({ onGenerate, isOnline, remainingCredits }) => {
    const [rows, setRows] = useState<Row[]>([
        { id: Date.now(), name: '', imageUrl: '', imageFile: null, imagePreview: null, incorporateImage: true, error: null }
    ]);
    const [templateId, setTemplateId] = useState(defaultPromptTemplate.id);
    const [globalError, setGlobalError] = useState('');
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const addRow = () => {
        setRows(prevRows => [...prevRows, { id: Date.now(), name: '', imageUrl: '', imageFile: null, imagePreview: null, incorporateImage: true, error: null }]);
    };

    const removeRow = (id: number) => {
        setRows(prevRows => prevRows.filter(row => row.id !== id));
    };

    const handleRowChange = <K extends keyof Row>(id: number, field: K, value: Row[K]) => {
        setRows(prevRows => prevRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const file = e.target.files?.[0];
        if (file) {
            let error = null;
            if (file.size > 2 * 1024 * 1024) {
                error = 'Image must be < 2MB.';
            } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                error = 'Must be JPG or PNG.';
            }

            if (error) {
                handleRowChange(id, 'error', error);
                handleRowChange(id, 'imageFile', null);
                handleRowChange(id, 'imagePreview', null);
                return;
            }

            const base64 = await fileToBase64(file);
            setRows(prevRows => prevRows.map(row => (row.id === id ? {
                ...row,
                imageFile: file,
                imagePreview: base64,
                imageUrl: '', // Clear URL if file is uploaded
                error: null
            } : row)));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError('');

        const validRows = rows.filter(row => row.name.trim());
        if (validRows.length === 0) {
            setGlobalError('Please enter at least one name.');
            return;
        }

        const selectedTemplate = promptTemplates.find(t => t.id === templateId);
        if (!selectedTemplate) {
            setGlobalError('Please select a valid template.');
            return;
        }

        const contacts: Contact[] = validRows.map(row => {
            let profileImageUrl: string | undefined = undefined;
            if (row.incorporateImage) {
                profileImageUrl = row.imagePreview || (row.imageUrl.trim() ? row.imageUrl.trim() : undefined);
            }
            return {
                name: row.name.trim(),
                profileImageUrl,
            };
        });

        onGenerate(contacts, selectedTemplate.template);
    };

    const isFormValid = rows.some(r => r.name.trim() !== '') && !!templateId && isOnline && remainingCredits > 0;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Inputs */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Enter Your Contacts</h3>
                            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                                {rows.map((row, index) => (
                                    <div key={row.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                                        <div className="flex-grow space-y-3">
                                            <input
                                                type="text"
                                                placeholder={`Person ${index + 1} Name`}
                                                value={row.name}
                                                onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                                                className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Paste public image URL (optional)"
                                                value={row.imageUrl}
                                                onChange={(e) => {
                                                    handleRowChange(row.id, 'imageUrl', e.target.value)
                                                    handleRowChange(row.id, 'imageFile', null)
                                                    handleRowChange(row.id, 'imagePreview', null)
                                                    handleRowChange(row.id, 'error', null)
                                                }}
                                                className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                                            />
                                             <label className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <input
                                                    type="checkbox"
                                                    checked={row.incorporateImage}
                                                    onChange={(e) => handleRowChange(row.id, 'incorporateImage', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={!row.imageUrl && !row.imagePreview}
                                                />
                                                <span className="ml-2">Incorporate image into design</span>
                                            </label>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRefs.current[row.id]?.click()}
                                                className="w-24 h-24 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                            >
                                                {row.imagePreview ? (
                                                    <img src={row.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UploadIcon className="w-8 h-8"/>
                                                )}
                                            </button>
                                            {row.error && <p className="text-xs text-red-400">{row.error}</p>}
                                            <input
                                                // FIX: The ref callback function should not return a value. Using a block statement `{}` resolves the TypeScript error.
                                                ref={el => { fileInputRefs.current[row.id] = el; }}
                                                type="file" className="sr-only" accept="image/png, image/jpeg, image/webp"
                                                onChange={(e) => handleFileChange(e, row.id)}
                                            />
                                            {rows.length > 1 && (
                                                <button type="button" onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <CloseIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addRow}
                                className="w-full text-sm font-semibold text-blue-500 hover:text-blue-400 py-2"
                            >
                                + Add another person
                            </button>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                Image Guidance: Square JPG/PNG works best, max 2MB.
                            </p>
                        </div>

                        {/* Right Column: Template Selection */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">Choose Image Style</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[30rem] overflow-y-auto pr-2">
                                {promptTemplates.map(template => (
                                    <div key={template.id} onClick={() => setTemplateId(template.id)}
                                        className={`group cursor-pointer rounded-lg border-2 p-1 transition-all ${templateId === template.id ? 'border-blue-500' : 'border-gray-600 hover:border-blue-400'}`}>
                                        <div className="relative aspect-square w-full bg-gray-700 rounded-md overflow-hidden">
                                            <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                                            {templateId === template.id && (
                                                <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center">
                                                    <CheckIcon className="w-8 h-8 text-white"/>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-semibold text-center text-gray-200 truncate p-2" title={template.name}>
                                            {template.name}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {globalError && <p className="text-red-400 text-center mt-4">{globalError}</p>}
                    <div className="pt-4 flex flex-col items-center">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="w-full max-w-xs inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Generate Cards
                        </button>
                        <p className="text-sm text-gray-400 mt-2">
                            {remainingCredits} credits remaining
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};