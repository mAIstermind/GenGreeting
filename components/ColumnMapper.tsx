import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates.ts';


interface ColumnMapperProps {
  headers: string[];
  onMap: (mapping: { name: string; email: string; prompt: string }, prompt: string) => void;
  onCancel: () => void;
  fileName: string;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ headers, onMap, onCancel, fileName }) => {
  const [nameColumn, setNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [promptColumn, setPromptColumn] = useState('');
  const [customPrompt, setCustomPrompt] = useState<string>(defaultPromptTemplate.template);

  useEffect(() => {
    // Auto-detect columns based on common names
    const nameGuess = headers.find(h => h.toLowerCase().includes('name'));
    const emailGuess = headers.find(h => ['email', 'e-mail'].includes(h.toLowerCase()));
    const promptGuess = headers.find(h => h.toLowerCase().includes('prompt') || h.toLowerCase().includes('custom'));

    if (nameGuess) setNameColumn(nameGuess);
    if (emailGuess) setEmailColumn(emailGuess);
    if (promptGuess) setPromptColumn(promptGuess);
  }, [headers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMappingValid) {
      onMap({ name: nameColumn, email: emailColumn, prompt: promptColumn }, customPrompt);
    }
  };

  const nameAndEmailSame = nameColumn && emailColumn && nameColumn === emailColumn;
  const nameAndPromptSame = nameColumn && promptColumn && nameColumn === promptColumn;
  const emailAndPromptSame = emailColumn && promptColumn && emailColumn === promptColumn;
  const hasMappingConflict = nameAndEmailSame || nameAndPromptSame || emailAndPromptSame;

  const isMappingValid = nameColumn && emailColumn && customPrompt.trim() !== '' && !hasMappingConflict;

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
                onChange={(e) => setNameColumn(e.target.value)}
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
                onChange={(e) => setEmailColumn(e.target.value)}
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
                    Prompt Customization <span className="text-base font-normal">(Optional)</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Add per-row text to the main prompt</span>
                </label>
                <select
                    id="prompt-column"
                    value={promptColumn}
                    onChange={(e) => setPromptColumn(e.target.value)}
                    className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">Do not customize</option>
                    {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                    ))}
                </select>
            </div>

            {hasMappingConflict && (
              <p className="text-red-500 text-sm text-center">Name, Email, and Prompt columns must be unique.</p>
            )}
        </fieldset>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <fieldset>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Write Your Custom Prompt</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter your prompt for the card images. Use <code className="bg-gray-200 dark:bg-gray-900 px-1 py-0.5 rounded-md text-sm font-mono text-blue-500">${'{firstName}'}</code> to insert the contact's first name.
            </p>

            <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., An elegant holiday card for ${firstName} with snowflakes and stars."
                className="w-full h-28 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            />
             <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Prompt Preview</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                  "{customPrompt.replace(/\${firstName}/g, '{name}')}"
                </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 mb-3">Or, start with a template:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {promptTemplates.map(template => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => setCustomPrompt(template.template)}
                  className={`
                    p-3 rounded-lg text-sm font-semibold transition-all duration-200 text-center
                    bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600
                  `}
                >
                  {template.name}
                </button>
              ))}
            </div>
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