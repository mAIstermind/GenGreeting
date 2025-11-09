

import React, { useState, useCallback } from 'react';
import type { Contact, GeneratedCard } from '../types.ts';
import type { GeminiService } from '../services/geminiService.ts';
import { promptTemplates, defaultPromptTemplate } from '../promptTemplates.ts';
import { GreetingCard } from './GreetingCard.tsx';
import { Loader } from './Loader.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

interface TrialGeneratorProps {
  geminiService: GeminiService;
  isOnline: boolean;
  onGenerationComplete: () => void;
  onEditCard: (card: GeneratedCard) => void;
  remainingGenerations: number;
  onRequestRegister: () => void;
  registeredTrialLimit: number;
}

const randomNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Sam', 'Jamie'];

export const TrialGenerator: React.FC<TrialGeneratorProps> = ({
  geminiService,
  isOnline,
  onGenerationComplete,
  onEditCard,
  remainingGenerations,
  onRequestRegister,
  registeredTrialLimit,
}) => {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(defaultPromptTemplate.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);

  const generateCard = useCallback(async (nameToGen: string, templateIdToGen: string) => {
    if (!nameToGen.trim() || !templateIdToGen || !isOnline || remainingGenerations <= 0) return;

    setIsLoading(true);
    setError(null);
    setGeneratedCard(null);

    try {
      const selectedTemplate = promptTemplates.find(t => t.id === templateIdToGen);
      if (!selectedTemplate) {
        throw new Error("Selected template not found.");
      }
      
      const contact: Contact = { name: nameToGen };
      const firstName = nameToGen.split(' ')[0];
      const imagePrompt = selectedTemplate.template.replace(/\${firstName}/g, firstName);

      const imageUrl = await geminiService.generateGreetingCardImage(imagePrompt);
      const newCard: GeneratedCard = { ...contact, imageUrl };
      
      setGeneratedCard(newCard);
      onGenerationComplete();

    } catch (err: any) {
      setError(err.message || 'Failed to generate card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [geminiService, isOnline, onGenerationComplete, remainingGenerations]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCard(name, templateId);
  };

  const handleSurpriseMe = () => {
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomTemplate = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
    setName(randomName);
    setTemplateId(randomTemplate.id);
    generateCard(randomName, randomTemplate.id);
  };
  
  const handleReset = () => {
    setName('');
    setGeneratedCard(null);
    setError(null);
  };

  // Always show the generated card if it exists. This is the highest priority.
  if (generatedCard) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white text-center">Your Card is Ready!</h2>
          <GreetingCard card={generatedCard} onEdit={onEditCard} />
          <button
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600"
          >
            Create Another
          </button>
      </div>
    );
  }

  // If the user is out of generations, show a prompt to register.
  if (remainingGenerations <= 0) {
      return (
          <div className="w-full max-w-2xl mx-auto text-center bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">You've used your free generation.</h2>
              <p className="text-gray-400 mb-6">
                  To continue generating, please register for a free account. You'll get {registeredTrialLimit} more generations and unlock batch CSV uploads.
              </p>
              <button
                  onClick={onRequestRegister}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                  Register for Free
              </button>
          </div>
      );
  }


  // Otherwise, show the generation form.
  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-white text-center">Generate an AI-Powered Greeting Card</h2>
            <p className="text-gray-400 text-center mt-2 max-w-2xl mx-auto">
                Get a taste of what our platform can do. Enter a name, choose a style, and create a unique, attention-grabbing image. Register to unlock batch CSV uploads and custom branding.
            </p>
            <p className="text-center text-sm text-gray-300 mt-4">
                You have <strong className="text-white">{remainingGenerations}</strong> free generation{remainingGenerations !== 1 ? 's' : ''} remaining.
            </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label htmlFor="name-input" className="text-lg font-medium text-gray-300 flex-shrink-0">Recipient's Name:</label>
            <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                required
                className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        <fieldset>
            <h3 className="text-2xl font-bold text-white text-center mb-6">Select an Image Style</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {promptTemplates.map(template => (
                    <div key={template.id} onClick={() => setTemplateId(template.id)}
                        className={`
                            group cursor-pointer rounded-lg border-2 p-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 flex flex-col
                            ${templateId === template.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'}
                            transition-all duration-200
                        `}
                    >
                        <div className="aspect-square w-full bg-gray-700 rounded-md overflow-hidden mb-2">
                             <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                        </div>
                        <div className="text-center mt-auto">
                            <h3 className="text-sm font-semibold text-gray-200 truncate" title={template.name}>
                                {template.name}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </fieldset>
        
        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
           <button
            type="button"
            disabled={isLoading || !isOnline || remainingGenerations <= 0}
            onClick={handleSurpriseMe}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Surprise Me ✨
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !templateId || isLoading || !isOnline || remainingGenerations <= 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader /> : <> <SparklesIcon className="w-6 h-6" /> Generate Card </>}
          </button>
        </div>
      </form>
    </div>
  );
};