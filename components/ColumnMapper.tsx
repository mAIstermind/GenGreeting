import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates.ts';

interface ColumnMapperProps {
  headers: string[];
  onMap: (mapping: { name: string; email: string; prompt: string }, templateId: string) => void;
  onCancel: () => void;
  fileName: string;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ headers, onMap, onCancel, fileName }) => {
  const [nameColumn, setNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [promptColumn, setPromptColumn] = useState('');
  const [templateId, setTemplateId] = useState(defaultPromptTemplate.id);

  useEffect(() => {
    // Auto-detect columns based on common names
    const nameGuess = headers.find(h => h.toLowerCase().includes('name'));
    const emailGuess = headers.find(h => ['email', 'e-mail'].includes(h.toLowerCase()));
    const promptGuess = headers.find(h => h.toLowerCase().includes('prompt') || h.toLowerCase().includes('custom'));

    if (nameGuess) setNameColumn(nameGuess);
    if (emailGuess) setEmailColumn(emailGuess);
    if (promptGuess) setPromptColumn(promptGuess);
  }, [headers]);

  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNameColumn(value);
    if (value && value === emailColumn) setEmailColumn('');
    if (value && value === promptColumn) setPromptColumn('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEmailColumn(value);
    if (value && value === nameColumn) setNameColumn('');
    if (value && value === promptColumn) setPromptColumn('');
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPromptColumn(value);
    if (value && value === nameColumn) setNameColumn('');
    if (value && value === emailColumn) setEmailColumn('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMappingValid) {
      onMap({ name: nameColumn, email: emailColumn, prompt: promptColumn }, templateId);
    }
  };

  const isMappingValid = nameColumn && emailColumn && templateId;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Map CSV Columns</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Map columns from <span className="font-semibold text-blue-500">{fileName}</span> to the required fields.
            </p>
        </div>
      
        <fieldset className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="name-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                Contact Name
                <span className="block text-sm text-gray-500 dark:text-gray-400">e.g., 'Full Name', 'First Name'</span>
            </label>
            <select
                id="name-column"
                value={nameColumn}
                onChange={handleNameChange}
                className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option value="">Select a column...</option>
                {headers.map(header => (
                <option key={header} value={header}>{header}</option>
                ))}
            </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="email-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                Contact Email
                <span className="block text-sm text-gray-500 dark:text-gray-400">e.g., 'Email Address'</span>
            </label>
            <select
                id="email-column"
                value={emailColumn}
                onChange={handleEmailChange}
                className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option value="">Select a column...</option>
                {headers.map(header => (
                <option key={header} value={header}>{header}</option>
                ))}
            </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="prompt-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                    Theme Customization <span className="text-base font-normal">(Optional)</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Add per-row text to the main theme</span>
                </label>
                <select
                    id="prompt-column"
                    value={promptColumn}
                    onChange={handlePromptChange}
                    className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">Do not customize</option>
                    {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                    ))}
                </select>
            </div>
        </fieldset>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <fieldset>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Select Image Style</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose a creative style for the AI to use. This style will be applied to every person in your list.
            </p>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {promptTemplates.map(template => (
                    <div key={template.id} onClick={() => setTemplateId(template.id)}
                        className={`
                            group cursor-pointer rounded-lg border-2 p-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 flex flex-col
                            ${templateId === template.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'}
                            transition-all duration-200
                        `}
                    >
                        <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-2">
                             <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                        </div>
                        <div className="text-center mt-auto">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={template.name}>
                                {template.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-1" title={template.description}>{template.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic text-center">
                Prompt Preview: "{promptTemplates.find(t => t.id === templateId)?.template.replace(/\${firstName}/g, '[Recipient Name]') || ''}"
            </p>
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
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-5 h-5" />
            Confirm & Proceed
          </button>
        </div>
      </form>
    </div>
  );
};