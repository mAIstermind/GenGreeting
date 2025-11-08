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
import { HelpModal } from './components/HelpModal.tsx';
import { RefreshIcon } from './components/icons/RefreshIcon.tsx';
import { ZipIcon } from './components/icons/ZipIcon.tsx';
import { UserCircleIcon } from './components/icons/UserCircleIcon.tsx';
import { LoginIcon } from './components/icons/LoginIcon.tsx';
import { LogoutIcon } from './components/icons/LogoutIcon.tsx';
import { QuestionMarkIcon } from './components/icons/QuestionMarkIcon.tsx';
import { UpgradeIcon } from './components/icons/UpgradeIcon.tsx';
import { geminiService } from './services/geminiService.ts';
import type { Contact, GeneratedCard } from './types.ts';
import { ImageGenerator } from './components/ImageGenerator.tsx';
import type { BrandingConfig } from './branding.ts';
import { promptTemplates } from './promptTemplates.ts';

type AppState = 'idle' | 'mapping' | 'generating' | 'done';
type AuthModalState = 'login' | 'register' | null;

interface Subscription {
  planName: string;
  monthlyLimit: number;
  cycleStartDate: number;
  usedInCycle: number;
}

const PLANS = {
  pro: { name: 'Pro', limit: 500 },
  business: { name: 'Business', limit: 2500 },
  agency: { name: 'Agency', limit: 10000 },
};

const TRIAL_LIMIT = 10;
const TRIAL_STORAGE_KEY = 'aigreetings_trial_count';
const SUBSCRIPTION_STORAGE_KEY = 'aigreetings_subscription';


function App() {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [appState, setAppState] = useState<AppState>('idle');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [editingCard, setEditingCard] = useState<GeneratedCard | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brand_name') || '');
  const [brandLogo, setBrandLogo] = useState<string | null>(() => localStorage.getItem('brand_logo'));
  const [isBranding, setIsBranding] = useState(false);
  const [activeTab, setActiveTab] = useState<'csv' | 'single'>('csv');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalState>(null);
  const [trialGenerationsUsed, setTrialGenerationsUsed] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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
            const fallbackConfig = { appName: 'Greetings', appAccent: 'AI', fullAppName: 'AI Greetings' };
            setBrandingConfig(fallbackConfig);
            document.title = `${fallbackConfig.fullAppName} - AI Card Generator`;
        }
    } catch (error) {
        console.error("Failed to parse branding configuration:", error);
        const fallbackConfig = { appName: 'Greetings', appAccent: 'AI', fullAppName: 'AI Greetings' };
        setBrandingConfig(fallbackConfig);
        document.title = `${fallbackConfig.fullAppName} - AI Card Generator`;
    }
  }, []);
  
  const checkSubscriptionCycle = (sub: Subscription): Subscription => {
      const cycleStartDate = new Date(sub.cycleStartDate);
      const now = new Date();

      // Check if the current month and year are different from the cycle start month and year.
      // This accurately handles the transition to a new calendar month, fixing the previous 30-day bug.
      if (now.getMonth() !== cycleStartDate.getMonth() || now.getFullYear() !== cycleStartDate.getFullYear()) {
          const newSub = { ...sub, usedInCycle: 0, cycleStartDate: now.getTime() };
          localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
          return newSub;
      }
      
      return sub;
  };

  const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      setAuthModal(null);
      // Simulate giving user the "Pro" plan on first login
      const newSub: Subscription = {
          planName: 'pro',
          monthlyLimit: PLANS.pro.limit,
          cycleStartDate: Date.now(),
          usedInCycle: 0,
      };
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
      setSubscription(newSub);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSubscription(null);
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const storedTrialCount = localStorage.getItem(TRIAL_STORAGE_KEY);
    setTrialGenerationsUsed(storedTrialCount ? parseInt(storedTrialCount, 10) : 0);
    
    const storedSub = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if(storedSub) {
      try {
        const parsedSub = JSON.parse(storedSub);
        const currentSub = checkSubscriptionCycle(parsedSub);
        setSubscription(currentSub);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Failed to parse subscription data", e);
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
      }
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const verifyApiConfiguration = async () => {
      try {
        await geminiService.checkApiHealth();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsInitializing(false);
      }
    };
    verifyApiConfiguration();
  }, []);

  const handleSettingsSave = (newName: string, newLogo: string | null) => {
    setBrandName(newName);
    localStorage.setItem('brand_name', newName);
    if (newLogo) {
      setBrandLogo(newLogo);
      localStorage.setItem('brand_logo', newLogo);
    } else {
      setBrandLogo(null);
      localStorage.removeItem('brand_logo');
    }
    setIsSettingsOpen(false);
  };

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

  const handleMap = (mapping: { name: string; email: string; prompt: string; }, templateId: string) => {
    if (!csvFile) return;

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
        
        // Check generation limits
        if (isLoggedIn && subscription) {
            const remaining = subscription.monthlyLimit - subscription.usedInCycle;
            if (parsedContacts.length > remaining) {
                setError(
                    <span>
                        Your current plan has {remaining} generations left this cycle, but your spreadsheet has {parsedContacts.length} contacts.
                        <a href="/ghl-pricing-page.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:underline ml-2">
                            Please upgrade your plan
                        </a>
                        &nbsp;or upload a smaller file.
                    </span>
                );
                setAppState('idle');
                return;
            }
        } else {
            const remaining = TRIAL_LIMIT - trialGenerationsUsed;
            if (parsedContacts.length > remaining) {
              setError(
                <span>
                  Your free trial has {remaining > 0 ? `${remaining} generations` : 'no generations'} left. Your spreadsheet has {parsedContacts.length} contacts.&nbsp;
                  <a href="/ghl-pricing-page.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:underline">
                    Please upgrade your plan
                  </a>
                  &nbsp;or upload a smaller file.
                </span>
              );
              setAppState('idle');
              return;
            }
        }

        setContacts(parsedContacts);

        if (parsedContacts.length === 0) {
          setError("No valid contacts found in the CSV file.");
          setAppState('idle');
          return;
        }

        const selectedTemplate = promptTemplates.find(t => t.id === templateId);
        if (!selectedTemplate) {
            setError("The selected image style template could not be found.");
            setAppState('idle');
            return;
        }

        const newCards: GeneratedCard[] = [];
        for (let i = 0; i < parsedContacts.length; i++) {
          try {
            const contact = parsedContacts[i];
            const firstName = contact.name.split(' ')[0];
            let imagePrompt = selectedTemplate.template
              .replace(/\${firstName}/g, firstName)
              .replace(/\${email}/g, contact.email);

            if (contact.customPromptDetail) {
                imagePrompt += ` Also incorporate this specific detail: "${contact.customPromptDetail}".`;
            }

            const imageUrl = await geminiService.generateGreetingCardImage(imagePrompt);
            const newCard: GeneratedCard = { ...contact, imageUrl };
            newCards.push(newCard);
            setGeneratedCards([...newCards]);
            setProgress(((i + 1) / parsedContacts.length) * 100);

            // Update usage counts
            if (isLoggedIn && subscription) {
              setSubscription(prev => {
                if (!prev) return null;
                const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                return newSub;
              });
            } else {
              setTrialGenerationsUsed(prev => {
                const newCount = prev + 1;
                localStorage.setItem(TRIAL_STORAGE_KEY, String(newCount));
                return newCount;
              });
            }
          } catch (err: any) {
            setError(`Failed to generate card for ${parsedContacts[i].name}. ${err.message}. Please try again.`);
            break; // Stop generation on error
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
        try {
            const response = await fetch(card.imageUrl);
            if (!response.ok) {
                console.warn(`Skipping failed image fetch for ${card.name} (status: ${response.status})`);
                continue;
            }
            const blob = await response.blob();
            const safeFileName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`greeting_card_${safeFileName}.png`, blob);
        } catch (err) {
            console.error(`Error processing or adding card for ${card.name} to zip:`, err);
        } finally {
            setProgress(50 + (((i + 1) / cardsToZip.length) * 50));
        }
    }

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
      saveAs(content, 'greeting_cards.zip');
      setIsBranding(false);
      setProgress(0);
    });
  };

  const renderContent = () => {
    const isDisabled = appState !== 'idle' || !isOnline;
    const remainingGenerations = isLoggedIn && subscription 
      ? subscription.monthlyLimit - subscription.usedInCycle
      : TRIAL_LIMIT - trialGenerationsUsed;

    if (remainingGenerations <= 0 && appState === 'idle') {
      return (
        <div className="text-center bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            {isLoggedIn ? 'You have used all your credits for this cycle.' : 'You have used all your free trial generations.'}
          </h2>
          <p className="text-gray-300 mb-6">
            To continue generating beautiful, personalized cards, please upgrade your plan.
          </p>
          <a
            href="/ghl-pricing-page.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <UpgradeIcon className="w-5 h-5"/>
            Upgrade Your Plan
          </a>
        </div>
      );
    }
    
    switch (appState) {
      case 'idle':
        return (
          <>
            <FileUpload onFileSelect={handleFileSelect} disabled={isDisabled} />
            {!isLoggedIn && (
                <p className="text-center text-gray-400 mt-4">
                    You have {Math.max(0, remainingGenerations)} free generations remaining.
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
                 <button onClick={handleDownloadAll} disabled={isBranding || !isOnline} className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
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
      content: <ImageGenerator geminiService={geminiService} isOnline={isOnline} />,
    }
  };

  if (!brandingConfig || isInitializing) {
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
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            <span className="text-blue-400">{brandingConfig.appAccent}</span>{brandingConfig.appName}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && subscription && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-lg">
                <div className="text-sm">
                  <span className="font-bold text-white">{subscription.monthlyLimit - subscription.usedInCycle}</span>
                  <span className="text-gray-400"> / {subscription.monthlyLimit} credits left</span>
                </div>
                <a
                  href="/ghl-pricing-page.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  aria-label="Upgrade plan"
                >
                  <UpgradeIcon className="w-4 h-4" />
                  Upgrade
                </a>
              </div>
            )}
            {isLoggedIn ? (
              <>
                 <button
                  onClick={() => setIsHelpOpen(true)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Help"
                >
                  <QuestionMarkIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Open branding settings"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Log out"
                >
                  <LogoutIcon className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Help"
                >
                  <QuestionMarkIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setAuthModal('login')}
                  className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Log in"
                >
                  <LoginIcon className="w-5 h-5" />
                  Login
                </button>
                <button
                  onClick={() => setAuthModal('register')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 max-w-4xl mx-auto" role="alert">
            <strong className="font-bold">An Error Occurred: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
            <div className="mb-8 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {Object.entries(TABS).map(([key, tab]) => (
                    <button
                    key={key}
                    onClick={() => setActiveTab(key as 'csv' | 'single')}
                    className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg
                        ${activeTab === key
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }
                    `}
                    >
                    {tab.name}
                    </button>
                ))}
                </nav>
            </div>
            {!error && TABS[activeTab].content}
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {brandingConfig.fullAppName}. All Rights Reserved.</p>
        {!isOnline && <p className="text-yellow-400 font-bold mt-2">Offline Mode: Functionality is limited.</p>}
      </footer>

      {editingCard && (
        <EditModal 
          card={editingCard} 
          onClose={() => setEditingCard(null)} 
          onSave={handleEditSave}
          geminiService={geminiService}
          isOnline={isOnline}
        />
      )}
      {isSettingsOpen && (
        <SettingsModal
          initialName={brandName}
          initialLogo={brandLogo}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
        />
      )}
      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}
      {authModal === 'login' && (
        <LoginModal 
            onClose={() => setAuthModal(null)}
            onSwitchToRegister={() => setAuthModal('register')}
            onLoginSuccess={handleLoginSuccess}
        />
      )}
      {authModal === 'register' && (
        <RegisterModal
            onClose={() => setAuthModal(null)}
            onSwitchToLogin={() => setAuthModal('login')}
            onRegisterSuccess={() => { setIsLoggedIn(true); setAuthModal(null); }}
        />
      )}
    </div>
  );
}

export default App;