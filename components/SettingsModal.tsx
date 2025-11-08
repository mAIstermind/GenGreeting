import React, { useState, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon.tsx';
import { UploadIcon } from './icons/UploadIcon.tsx';

// FIX: Per coding guidelines, API key management is removed.
interface SettingsModalProps {
    initialName: string;
    initialLogo: string | null;
    onClose: () => void;
    onSave: (name: string, logo: string | null) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// FIX: Per coding guidelines, API key management is removed.
export const SettingsModal: React.FC<SettingsModalProps> = ({ initialName, initialLogo, onClose, onSave }) => {
    const [name, setName] = useState(initialName);
    const [logo, setLogo] = useState(initialLogo);
    // FIX: Per coding guidelines, API key state is removed.
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError('Image size must be less than 2MB.');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Please upload a JPG, PNG, or WEBP image.');
                return;
            }
            setError('');
            const base64 = await fileToBase64(file);
            setLogo(base64);
        }
    };

    const handleSave = () => {
        // FIX: Per coding guidelines, API key is no longer managed here.
        onSave(name, logo);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Branding &amp; Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Close settings modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* FIX: Per coding guidelines, the API Key input section has been removed. */}

                    <div>
                        <label htmlFor="brand-name" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                            Your Name / Business Name
                        </label>
                        <input
                            id="brand-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Jane Doe or Acme Inc."
                            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                           Your Logo / Profile Photo
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                                {logo ? (
                                    <img src={logo} alt="Logo preview" className="w-full h-full object-cover"/>
                                ) : (
                                    <UploadIcon className="w-8 h-8 text-gray-400"/>
                                )}
                            </div>
                            <div className="flex-grow">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Upload Image
                                </button>
                                {logo && (
                                     <button
                                        type="button"
                                        onClick={() => setLogo(null)}
                                        className="ml-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300"
                                    >
                                        Remove
                                    </button>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PNG, JPG, WEBP up to 2MB.</p>
                                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="sr-only"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};