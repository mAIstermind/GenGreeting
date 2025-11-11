import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates';

interface ColumnMapperProps {
  headers: string[];
  onMap: (mapping: { name: string; profileImage: string }, promptTemplate: string) => void;
  onCancel: () => void;
  fileName: string;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ headers, onMap, onCancel, fileName }) => {
  const [nameColumn, setNameColumn] = useState('');
  const [profileImageColumn, setProfileImageColumn] = useState('');
  const [templateId, setTemplateId] = useState(defaultPromptTemplate.id);
  const [promptMode, setPromptMode] = useState<'template' | 'custom'>('template');
  const [customPrompt, setCustomPrompt] = useState('');


  useEffect(() => {
    // Auto-detect columns based on common names
    const nameGuess = headers.find(h => h.toLowerCase().includes('name'));
    const imageGuess = headers.find(h => h.toLowerCase().includes('image') || h.toLowerCase().includes('logo') || h.toLowerCase().includes('url') || h.toLowerCase().includes('photo'));
    
    if (nameGuess) setNameColumn(nameGuess);
    if (imageGuess) setProfileImageColumn(imageGuess);
  }, [headers]);

  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNameColumn(value);
    if (value && value === profileImageColumn) setProfileImageColumn('');
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setProfileImageColumn(value);
    if (value && value === nameColumn) setNameColumn('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMappingValid) {
        if (promptMode === 'template') {
            const selectedTemplate = promptTemplates.find(t => t.id === templateId);
            if (selectedTemplate) {
                 onMap({ name: nameColumn, profileImage: profileImageColumn }, selectedTemplate.template);
            }
        } else {
             onMap({ name: nameColumn, profileImage: profileImageColumn }, customPrompt);
        }
    }
  };

  const isMappingValid = nameColumn && (promptMode === 'template' ? !!templateId : customPrompt.trim() !== '');

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Map Your CSV Column(s)</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Match the columns from <span className="font-semibold text-blue-500">{fileName}</span> to the fields below. Only the 'Name' column is required. Other columns in your file (like 'email') will be ignored.
            </p>
        </div>
      
        <fieldset className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="name-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                    Contact Name <span className="text-red-500">*</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">e.g., 'Full Name', 'First Name'</span>
                </label>
                <select
                    id="name-column"
                    value={nameColumn}
                    onChange={handleNameChange}
                    required
                    className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">Select a column...</option>
                    {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="profile-image-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                    Profile/Logo Image URL <span className="text-base font-normal">(Optional)</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Public URL to a JPG/PNG image.</span>
                </label>
                <select
                    id="profile-image-column"
                    value={profileImageColumn}
                    onChange={handleProfileImageChange}
                    className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">Do not map</option>
                    {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                    ))}
                </select>
            </div>
        </fieldset>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <fieldset>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Choose Image Style</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a pre-made style or write your own custom prompt for maximum creative control.
            </p>

            <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        type="button"
                        onClick={() => setPromptMode('template')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${promptMode === 'template' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                    >
                        Choose a Style
                    </button>
                    <button
                        type="button"
                        onClick={() => setPromptMode('custom')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${promptMode === 'custom' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                    >
                        Write a Custom Prompt
                    </button>
                </nav>
            </div>
            
            {promptMode === 'template' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {promptTemplates.map(template => (
                            <div key={template.id} onClick={() => setTemplateId(template.id)}
                                title={template.description}
                                className={`
                                    group cursor-pointer rounded-lg border-2 p-1
                                    ${templateId === template.id ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'}
                                    transition-all duration-200 flex flex-col bg-white dark:bg-gray-800
                                `}
                            >
                                <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-2">
                                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                                    {templateId === template.id && (
                                        <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center backdrop-blur-sm">
                                            <CheckIcon className="w-12 h-12 text-white opacity-90"/>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 text-center flex-grow flex flex-col justify-between">
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200" title={template.name}>
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 h-12 line-clamp-3">{template.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic text-center">
                        Prompt Preview: "{promptTemplates.find(t => t.id === templateId)?.template.replace(/\${firstName}/g, '[Name]') || ''}"
                    </p>
                </div>
            )}
            
            {promptMode === 'custom' && (
                <div className="animate-fade-in">
                    <label htmlFor="custom-prompt" className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                        Your Custom Prompt
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                        Use placeholders like <code className="text-xs bg-gray-600 px-1 py-0.5 rounded-md text-yellow-300">${`{firstName}`}</code> to personalize each card.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <button type="button" onClick={() => setCustomPrompt(p => p + '${firstName}')} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">${`{firstName}`}</button>
                    </div>
                    <textarea
                        id="custom-prompt"
                        rows={5}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 dark:text-gray-100"
                        placeholder="e.g., A watercolor painting of a friendly robot holding a sign that says 'Hello ${firstName}!'"
                        required
                    />
                </div>
            )}
        </fieldset>


        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isMappingValid}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            <CheckIcon className="w-5 h-5" />
            Confirm & Proceed
          </button>
        </div>
      </form>
    </div>
  );
};