import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileUpload } from './components/FileUpload.tsx';
import { ColumnMapper } from './components/ColumnMapper.tsx';
import { CardGrid } from './components/CardGrid.tsx';
import { ProgressBar } from './components/ProgressBar.tsx';
import { Loader } from './components/Loader.tsx';
import { EditModal } from './components/EditModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { RefreshIcon } from './components/icons/RefreshIcon.tsx';
import { ZipIcon } from './components/icons/ZipIcon.tsx';
import { UserCircleIcon } from './components/icons/UserCircleIcon.tsx';
import { LoginIcon } from './components/icons/LoginIcon.tsx';
import { LogoutIcon } from './components/icons/LogoutIcon.tsx';
import { createGeminiService, type GeminiService } from './services/geminiService.ts';
import type { Contact, GeneratedCard } from './types.ts';
import { ImageGenerator } from './components/ImageGenerator.tsx';
import type { BrandingConfig } from './branding.ts';

type AppState = 'idle' | 'mapping' | 'generating' | 'done';
type AuthModalState = 'login' | 'register' | null;
const TRIAL_LIMIT = 10;

function App() {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<GeneratedCard | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [isBranding, setIsBranding] = useState(false);
  const [activeTab, setActiveTab] = useState<'csv' | 'single'>('csv');

  // --- API Key & Service State ---
  // FIX: Per coding guidelines, API key UI and local storage are removed. The key is only read from process.env.
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalState>(null);
  const [cardsGeneratedInTrial, setCardsGeneratedInTrial] = useState(0);

  useEffect(() => {
    try {
        const configElement = document.getElementById('branding-config');
        if (configElement?.textContent) {
            const config = JSON.parse(configElement.textContent);
            const fullAppName = `${config.appAccent}${config.appName}`;
            document.title = `${fullAppName} - AI Card Generator`;
            setBrandingConfig({ ...config, fullAppName });
        } else {
            console.error("Branding configuration not found.");
            // Fallback branding
            const fallbackConfig = { appName: 'Greeting', appAccent: 'Gen', fullAppName: 'GenGreeting' };
            setBrandingConfig(fallbackConfig);
            document.title = `${fallbackConfig.fullAppName} - AI Card Generator`;
        }
    } catch (error) {
        console.error("Failed to parse branding configuration:", error);
        const fallbackConfig = { appName: 'Greeting', appAccent: 'Gen', fullAppName: 'GenGreeting' };
        setBrandingConfig(fallbackConfig);
        document.title = `${fallbackConfig.fullAppName} - AI Card Generator`;
    }
  }, []);

  // Effect to initialize the Gemini service
  useEffect(() => {
    // FIX: Per coding guidelines, only use API_KEY from environment variables.
    if (process.env.API_KEY) {
      try {
        setGeminiService(createGeminiService(process.env.API_KEY));
        setError(null); // Clear any previous errors on successful initialization
      } catch (e: any) {
        setError(`Failed to initialize AI Service: ${e.message}`);
        setGeminiService(null);
      }
    } else {
      setGeminiService(null);
      // FIX: Updated error message as settings-based API key is removed.
      setError("A Gemini API key is not configured. The application cannot function without it.");
    }
  }, []);


  const handleFileSelect = (file: File) => {
    setError(null);
    setCsvFile(file);
    Papa.parse(file, {
      header: false,
      preview: 1,
      complete: (results: any) => {
        const headers = results.data[0] as string[];
        if (headers && headers.length > 0) {
          setCsvHeaders(headers);
          setAppState('mapping');
        } else {
          setError('Could not parse headers from the CSV file.');
        }
      },
      error: (err: Error) => {
        setError(`Error parsing CSV file: ${err.message}`);
      }
    });
  };

  const handleMap = (mapping: { name: string; email: string; prompt: string; }, theme: string) => {
    if (!csvFile || !geminiService) return;

    setError(null);
    setAppState('generating');
    setProgress(0);
    setGeneratedCards([]);
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        let parsedContacts: Contact[] = results.data.map((row: any) => ({
          name: row[mapping.name] || '',
          email: row[mapping.email] || '',
          customPromptDetail: mapping.prompt ? row[mapping.prompt] || '' : '',
        })).filter((c: Contact) => c.name && c.email);
        
        if (!isLoggedIn && parsedContacts.length > (TRIAL_LIMIT - cardsGeneratedInTrial)) {
          setError(`As a guest, you can generate ${TRIAL_LIMIT - cardsGeneratedInTrial} more cards. Your CSV has ${parsedContacts.length}. Please log in or upload a smaller file.`);
          setAppState('idle');
          return;
        }

        setContacts(parsedContacts);

        if (parsedContacts.length === 0) {
          setError("No valid contacts found in the CSV file.");
          setAppState('idle');
          return;
        }

        const newCards: GeneratedCard[] = [];
        for (let i = 0; i < parsedContacts.length; i++) {
          try {
            const contact = parsedContacts[i];
            
            let finalTheme = theme;
            if (contact.customPromptDetail) {
              finalTheme += ` (${contact.customPromptDetail})`;
            }

            const imageConcept = await geminiService.generatePromptConcept(contact.name, finalTheme);
            const imageUrl = await geminiService.generateGreetingCardImage(contact.name.split(' ')[0], imageConcept);
            
            const newCard: GeneratedCard = { ...contact, imageUrl };
            newCards.push(newCard);
            setGeneratedCards([...newCards]);
            setProgress(((i + 1) / parsedContacts.length) * 100);
            if (!isLoggedIn) {
              setCardsGeneratedInTrial(prev => prev + 1);
            }
          } catch (err: any) {
            setError(`Failed to generate card for ${parsedContacts[i].name}. ${err.message}. Please try again.`);
          }
        }
        setAppState('done');
      },
      error: (err: Error) => {
        setError(`Error processing CSV file: ${err.message}`);
        setAppState('idle');
      }
    });
  };
  
  const handleCancelMap = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setAppState('idle');
  };
  
  const handleReset = () => {
    setAppState('idle');
    setCsvFile(null);
    setCsvHeaders([]);
    setContacts([]);
    setGeneratedCards([]);
    setProgress(0);
    setError(null);
  };

  const handleEditSave = (updatedCard: GeneratedCard) => {
    setGeneratedCards(prev => prev.map(c => c.email === updatedCard.email ? updatedCard : c));
    setEditingCard(null);
  };

  const handleDownloadAll = async () => {
    if (!geminiService) {
        setError("Cannot download, AI Service is not available.");
        return;
    }

    if (!isLoggedIn) {
      alert("Please log in or register to download your cards and unlock custom branding.");
      setAuthModal('login');
      return;
    }

    const zip = new JSZip();
    setIsBranding(true);
    setProgress(0);

    const cardsToZip = [...generatedCards];
    
    if (brandName || brandLogo) {
      for (let i = 0; i < cardsToZip.length; i++) {
          try {
            const brandedImageUrl = await geminiService.brandCardImage(cardsToZip[i].imageUrl, brandLogo, brandName, 'bottom-right');
            cardsToZip[i] = { ...cardsToZip[i], imageUrl: brandedImageUrl };
          } catch (e) {
            console.error("Failed to brand image for", cardsToZip[i].name);
          }
          setProgress(((i + 1) / cardsToZip.length) * 50);
      }
    }
    
    for (let i = 0; i < cardsToZip.length; i++) {
      const card = cardsToZip[i];
      const response = await fetch(card.imageUrl);
      const blob = await response.blob();
      const safeFileName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      zip.file(`greeting_card_${safeFileName}.png`, blob);
      setProgress(50 + (((i + 1) / cardsToZip.length) * 50));
    }

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
      saveAs(content, 'greeting_cards.zip');
      setIsBranding(false);
      setProgress(0);
    });
  };

  const renderContent = () => {
    const isDisabled = appState !== 'idle' || !geminiService;
    switch (appState) {
      case 'idle':
        return (
          <>
            <FileUpload onFileSelect={handleFileSelect} disabled={isDisabled} />
            {!isLoggedIn && (
                <p className="text-center text-gray-400 mt-4">
                    You have {TRIAL_LIMIT - cardsGeneratedInTrial} free generations remaining.
                </p>
            )}
          </>
        );
      case 'mapping':
        return <ColumnMapper headers={csvHeaders} onMap={handleMap} onCancel={handleCancelMap} fileName={csvFile?.name || ''} />;
      case 'generating':
        return (
          <div className="w-full max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Generating Greeting Cards...</h2>
            <p className="text-gray-300 mb-6">This may take a few moments. Please don't close this window.</p>
            <ProgressBar progress={progress} />
            <p className="mt-2 text-sm text-gray-400">{generatedCards.length} of {contacts.length} cards generated.</p>
          </div>
        );
      case 'done':
        return (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-white">Your Cards Are Ready!</h2>
              <div className="flex gap-2">
                 <button onClick={handleDownloadAll} disabled={isBranding || !geminiService} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                  {isBranding ? <Loader/> : <><ZipIcon className="w-5 h-5" /> Download All (.zip)</>}
                </button>
                <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600">
                  <RefreshIcon className="w-5 h-5" /> Start Over
                </button>
              </div>
            </div>
            {isBranding && (
              <div className="my-4">
                <p className="text-center text-white mb-2">Applying branding and zipping files...</p>
                <ProgressBar progress={progress} />
              </div>
            )}
            <CardGrid cards={generatedCards} onEditCard={(card) => setEditingCard(card)} />
          </>
        );
      default:
        return null;
    }
  };
  
  const TABS = {
    csv: {
      name: 'Batch Generate via CSV',
      content: renderContent(),
    },
    single: {
      name: 'Generate with Imagen',
      content: <ImageGenerator geminiService={geminiService} />,
    }
  };

  if (!brandingConfig) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading application...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            <span className="text-blue-400">{brandingConfig.appAccent}</span>{brandingConfig.appName}
          </h1>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-200 bg-white/10 hover:bg-white/20"
                  aria-label="Open branding settings"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Branding & Profile
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 hover:bg-gray-700"
                  aria-label="Log out"
                >
                  <LogoutIcon className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                 <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-200 bg-white/10 hover:bg-white/20"
                  aria-label="Open branding settings"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Settings
                </button>
                <button
                  onClick={() => setAuthModal('login')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-200 bg-white/10 hover:bg-white/20"
                  aria-label="Log in"
                >
                  <LoginIcon className="w-5 h-5" />
                  Login
                </button>
                <button
                  onClick={() => setAuthModal('register')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  aria-label="Register"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center border-b border-gray-700 mb-8">
                {Object.entries(TABS).map(([key, tab]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as 'csv' | 'single')}
                        className={`px-4 py-3 text-lg font-medium transition-colors duration-200 ${
                            activeTab === key
                                ? 'border-b-2 border-blue-500 text-blue-400'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-8 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                    <strong className="font-bold">An Error Occurred: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
          
            {TABS[activeTab].content}
        </div>
      </main>

      {editingCard && (
        <EditModal 
            card={editingCard} 
            onClose={() => setEditingCard(null)} 
            onSave={handleEditSave}
            geminiService={geminiService}
        />
      )}
      
      {isSettingsOpen && (
        <SettingsModal 
          initialName={brandName}
          initialLogo={brandLogo}
          onClose={() => setIsSettingsOpen(false)}
          // FIX: Per coding guidelines, API key management is removed from settings.
          onSave={(name, logo) => {
            setBrandName(name);
            setBrandLogo(logo);
            setIsSettingsOpen(false);
          }}
        />
      )}

      {authModal === 'login' && (
        <LoginModal 
            onClose={() => setAuthModal(null)}
            onSwitchToRegister={() => setAuthModal('register')}
            onLoginSuccess={() => {
                setIsLoggedIn(true);
                setAuthModal(null);
            }}
        />
      )}

      {authModal === 'register' && (
        <RegisterModal 
            onClose={() => setAuthModal(null)}
            onSwitchToLogin={() => setAuthModal('login')}
            onRegisterSuccess={() => {
                setIsLoggedIn(true);
                setAuthModal(null);
            }}
        />
      )}
    </div>
  );
}

export default App;