
import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates.ts';

interface ColumnMapperProps {
  headers: string[];
  onMap: (mapping: { name: string; email: string; profileImage: string }, templateId: string) => void;
  onCancel: () => void;
  fileName: string;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ headers, onMap, onCancel, fileName }) => {
  const [nameColumn, setNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [profileImageColumn, setProfileImageColumn] = useState('');
  const [templateId, setTemplateId] = useState(defaultPromptTemplate.id);

  useEffect(() => {
    // Auto-detect columns based on common names
    const nameGuess = headers.find(h => h.toLowerCase().includes('name'));
    const emailGuess = headers.find(h => h.toLowerCase().includes('email'));
    const imageGuess = headers.find(h => h.toLowerCase().includes('image') || h.toLowerCase().includes('logo') || h.toLowerCase().includes('url') || h.toLowerCase().includes('photo'));

    if (nameGuess) setNameColumn(nameGuess);
    if (emailGuess) setEmailColumn(emailGuess);
    if (imageGuess) setProfileImageColumn(imageGuess);
  }, [headers]);

  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNameColumn(value);
    if (value && value === profileImageColumn) setProfileImageColumn('');
    if (value && value === emailColumn) setEmailColumn('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEmailColumn(value);
    if (value && value === nameColumn) setNameColumn('');
    if (value && value === profileImageColumn) setProfileImageColumn('');
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setProfileImageColumn(value);
    if (value && value === nameColumn) setNameColumn('');
    if (value && value === emailColumn) setEmailColumn('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMappingValid) {
      onMap({ name: nameColumn, email: emailColumn, profileImage: profileImageColumn }, templateId);
    }
  };

  const isMappingValid = nameColumn && templateId;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Map Your CSV Column(s)</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Match the columns from <span className="font-semibold text-blue-500">{fileName}</span> to the fields below. Only 'Name' is required.
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
                <label htmlFor="email-column" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                    Email Address <span className="text-base font-normal">(Optional)</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Used for templates like 'Email Signature'</span>
                </label>
                <select
                    id="email-column"
                    value={emailColumn}
                    onChange={handleEmailChange}
                    className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">Do not map</option>
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Select Image Style</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose a creative style for the AI to use. This style will be applied to every person in your list.
            </p>
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
                Prompt Preview: "{promptTemplates.find(t => t.id === templateId)?.template.replace(/\${firstName}/g, '[Recipient Name]').replace(/\${email}/g, '[recipient@email.com]') || ''}"
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