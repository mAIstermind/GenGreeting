

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileUpload } from './components/FileUpload';
import { ColumnMapper } from './components/ColumnMapper';
import { CardGrid } from './components/CardGrid';
import { ProgressBar } from './components/ProgressBar';
import { Loader } from './components/Loader';
import { EditModal } from './components/EditModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { HelpModal } from './components/HelpModal';
import { TrialGenerator } from './components/TrialGenerator';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PwaInstallModal } from './components/PwaInstallModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import { CogIcon } from './components/icons/CogIcon';
import { LoginIcon } from './components/icons/LoginIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { QuestionMarkIcon } from './components/icons/QuestionMarkIcon';
import { UpgradeIcon } from './components/icons/UpgradeIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { geminiService } from './services/geminiService';
import type { Contact, GeneratedCard, AgencyConfig } from './types';
import { ImageGenerator } from './components/ImageGenerator';
import type { BrandingConfig } from './branding';
import { GreetingCard } from './components/GreetingCard';
import { UserCircleIcon } from './components/icons/UserCircleIcon';
import { Footer } from './components/Footer';

type AppState = 'idle' | 'mapping' | 'generating' | 'done';
type AuthModalState = 'login' | 'register' | null;
type Theme = 'light' | 'dark';

interface Subscription {
  planName: string;
  monthlyLimit: number;
  bonusCredits?: number; // For beta testers
  foreverBonus?: number; // For the magnanimous bonus
  cycleStartDate: number;
  usedInCycle: number;
}

// A type guard for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DEFAULT_PLANS = {
  pro: { name: 'Pro', limit: 500 },
  business: { name: 'Business', limit: 2500 },
  agency: { name: 'Agency', limit: 10000 },
};

const REGISTERED_TRIAL_LIMIT = 10;
const UNREGISTERED_TRIAL_LIMIT = 1;
const TRIAL_STORAGE_KEY = 'aigreetings_trial_count';
const SUBSCRIPTION_STORAGE_KEY = 'aigreetings_subscription';
const THEME_STORAGE_KEY = 'aigreetings_theme';
const BETA_TESTER_COUPON_CODE = 'BETA2025';
const FOREVER_50_CODE = 'FOREVER50';


function App() {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [agencyLegal, setAgencyLegal] = useState<{ privacy?: string, terms?: string }>({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [appState, setAppState] = useState<AppState>('idle');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [previewCard, setPreviewCard] = useState<GeneratedCard | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [editingCard, setEditingCard] = useState<GeneratedCard | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPwaInstallModalOpen, setIsPwaInstallModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [brandName, setBrandName] = useState(() => localStorage.getItem('brand_name') || '');
  const [brandLogo, setBrandLogo] = useState<string | null>(() => localStorage.getItem('brand_logo'));
  const [isBranding, setIsBranding] = useState(false);
  const [activeTab, setActiveTab] = useState<'csv' | 'single'>('csv');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Theme State ---
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'dark');

  // --- PWA Install State ---
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalState>(null);
  const [couponCodeFromUrl, setCouponCodeFromUrl] = useState<string | null>(null);
  const [foreverCodeFromUrl, setForeverCodeFromUrl] = useState<string | null>(null);
  const [trialGenerationsUsed, setTrialGenerationsUsed] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  // Effect for theme management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const loadConfig = () => {
        // 1. Try to load agency config first
        try {
            const agencyConfigStr = localStorage.getItem('aigreetings_agency_config');
            if (agencyConfigStr) {
                const config: AgencyConfig = JSON.parse(agencyConfigStr);
                const fullAppName = `${config.appAccent}${config.appName}`;
                document.title = `${fullAppName} - AI Card Generator`;
                setBrandingConfig({ ...config, fullAppName });
                setPlans(config.plans);
                if(config.logo) {
                  // Pre-populate branding settings with agency logo
                  setBrandLogo(config.logo);
                  localStorage.setItem('brand_logo', config.logo);
                }
                // Load custom legal documents if they exist
                if (config.privacyPolicy || config.termsAndConditions) {
                  setAgencyLegal({
                    privacy: config.privacyPolicy,
                    terms: config.termsAndConditions
                  });
                }
                return; // Exit if agency config is loaded
            }
        } catch (error) {
            console.error("Failed to parse agency configuration:", error);
        }

        // 2. Fallback to default branding from index.html
        try {
            const configElement = document.getElementById('branding-config');
            if (configElement?.textContent) {
                const config = JSON.parse(configElement.textContent);
                const fullAppName = `${config.appAccent}${config.appName}`;
                document.title = `${fullAppName} - AI Card Generator`;
                setBrandingConfig({ ...config, fullAppName });
            } else {
                throw new Error("Branding config element not found.");
            }
        } catch (error) {
            console.error("Failed to load default branding configuration:", error);
            const fallbackConfig = { appName: 'Greetings', appAccent: 'AI', fullAppName: 'AI Greetings' };
            setBrandingConfig(fallbackConfig);
            document.title = `${fallbackConfig.fullAppName} - AI Card Generator`;
        }
    };
    loadConfig();
  }, []);
  
  const checkSubscriptionCycle = useCallback((sub: Subscription): Subscription => {
      const cycleStartDate = new Date(sub.cycleStartDate);
      const now = new Date();

      if (now.getMonth() !== cycleStartDate.getMonth() || now.getFullYear() !== cycleStartDate.getFullYear()) {
          const newSub = { ...sub, usedInCycle: 0, cycleStartDate: now.getTime() };
          localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
          return newSub;
      }
      
      return sub;
  }, []);

  const handleRegisterSuccess = (couponCode?: string, foreverCode?: string) => {
      setIsLoggedIn(true);
      setAuthModal(null);

      const isBetaTester = couponCode === BETA_TESTER_COUPON_CODE;
      const hasForeverBonus = foreverCode === FOREVER_50_CODE;

      // All new registrations start on a free trial plan
      const newSub: Subscription = {
          planName: 'Trial',
          monthlyLimit: REGISTERED_TRIAL_LIMIT, // 10 generations for free trial
          ...(isBetaTester && { bonusCredits: 1000 }),
          ...(hasForeverBonus && { foreverBonus: 50 }),
          cycleStartDate: Date.now(),
          usedInCycle: 0,
      };
      
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
      setSubscription(newSub);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthModal(null);
    const storedSub = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if(storedSub) {
      try {
        const parsedSub = JSON.parse(storedSub);
        const currentSub = checkSubscriptionCycle(parsedSub);
        setSubscription(currentSub);
      } catch (e) {
        console.error("Failed to parse subscription data on login", e);
        // If parsing fails, maybe create a new trial subscription
         handleRegisterSuccess();
      }
    } else {
       // If no subscription exists for a logged-in user, create a new trial one.
       handleRegisterSuccess();
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setSubscription(null);
    // Note: We don't remove the subscription from localStorage on logout,
    // so their usage data is preserved if they log back in.
    // If you wanted to clear it: localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        setInstallPromptEvent(event as BeforeInstallPromptEvent);
        setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Handle bonus codes from URL for exclusive registration
    const urlParams = new URLSearchParams(window.location.search);
    const betaCode = urlParams.get('betacode');
    const foreverCode = urlParams.get('magnanimous');
    let shouldOpenRegister = false;

    if (betaCode === BETA_TESTER_COUPON_CODE) {
      setCouponCodeFromUrl(betaCode);
      shouldOpenRegister = true;
    }
    
    if (foreverCode === FOREVER_50_CODE) {
      setForeverCodeFromUrl(foreverCode);
      shouldOpenRegister = true;
    }
    
    const storedSub = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (shouldOpenRegister && !storedSub) {
        setAuthModal('register');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedTrialCount = localStorage.getItem(TRIAL_STORAGE_KEY);
    setTrialGenerationsUsed(storedTrialCount ? parseInt(storedTrialCount, 10) : 0);
    
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
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [checkSubscriptionCycle]);

  const handleInstallPrompt = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then(() => {
        setInstallPromptEvent(null);
        setShowInstallBanner(false);
      });
    }
  };

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

  const handleMap = (mapping: { name: string; email: string; profileImage: string }, promptTemplate: string) => {
    if (!csvFile) return;

    setError(null);
    setAppState('generating');
    setProgress(0);
    setGeneratedCards([]);
    setPreviewCard(null);
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        let parsedContacts: Contact[] = results.data.map((row: any) => ({
          name: row[mapping.name] || '',
          email: row[mapping.email] || '',
          profileImageUrl: mapping.profileImage ? row[mapping.profileImage] || '' : '',
        })).filter((c: Contact) => c.name);
        
        if (isLoggedIn && subscription) {
            const totalCredits = subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0);
            const remaining = totalCredits - subscription.usedInCycle;
            if (parsedContacts.length > remaining) {
                setError(
                    <span>
                        Your current plan has {remaining} generations left this cycle, but your spreadsheet has {parsedContacts.length} contacts.
                        <a href="https://maistermind.com/gengreeting-pricing" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:underline ml-2">
                            Please upgrade your plan
                        </a>
                        &nbsp;or upload a smaller file.
                    </span>
                );
                setAppState('idle');
                return;
            }
        } else {
            setError("An error occurred. Please log in to perform batch generation.");
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
        const generationErrors: string[] = [];

        for (let i = 0; i < parsedContacts.length; i++) {
          const contact = parsedContacts[i];
          try {
            const firstName = contact.name.split(' ')[0];
            const firstInitial = firstName.charAt(0).toUpperCase();

            const imagePrompt = promptTemplate
                .replace(/\${firstName}/g, firstName)
                .replace(/\${firstInitial}/g, firstInitial)
                .replace(/\${email}/g, contact.email || '');

            let imageUrl;
            if (contact.profileImageUrl) {
                imageUrl = await geminiService.generatePersonalizedCard(imagePrompt, contact.profileImageUrl);
            } else {
                imageUrl = await geminiService.generateGreetingCardImage(imagePrompt);
            }

            const newCard: GeneratedCard = { ...contact, imageUrl };
            newCards.push(newCard);
            if (i === 0) {
                setPreviewCard(newCard);
            }
            setGeneratedCards(prevCards => [...prevCards, newCard]);
            
            if (isLoggedIn && subscription) {
              setSubscription(prev => {
                if (!prev) return null;
                const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                return newSub;
              });
            }
          } catch (err: any) {
            console.error(`Error for ${contact.name}:`, err);
            generationErrors.push(`- ${contact.name}: ${err.message}`);
          } finally {
             setProgress(((i + 1) / parsedContacts.length) * 100);
          }
        }
        
        if(generationErrors.length > 0) {
            setError(
                <div>
                    <p className="font-bold mb-2">Generation completed, but {generationErrors.length} card(s) failed:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {generationErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            );
        }

        setAppState('done');
      },
      error: (err: Error) => {
        setError(`Error processing CSV file: ${err.message}`);
        setAppState('idle');
      }
    });
  };

    const handleTrialGeneration = () => {
        setTrialGenerationsUsed(prev => {
            const newCount = prev + 1;
            localStorage.setItem(TRIAL_STORAGE_KEY, String(newCount));
            return newCount;
        });
    };
  
  const handleCancelMap = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setAppState('idle');
    setPreviewCard(null);
  };
  
  const handleReset = () => {
    setAppState('idle');
    setCsvFile(null);
    setCsvHeaders([]);
    setContacts([]);
    setGeneratedCards([]);
    setProgress(0);
    setError(null);
    setPreviewCard(null);
    setActiveTab('csv');
  };

  const handleEditCard = (card: GeneratedCard) => {
    setEditingCard(card);
  };

  const handleUpdateCard = (updatedCard: GeneratedCard) => {
    setGeneratedCards(currentCards => 
      currentCards.map(c => (c.name === updatedCard.name && c.imageUrl === editingCard?.imageUrl) ? updatedCard : c)
    );
    setEditingCard(null);
  };

  const handleDownloadAll = useCallback(async (applyBranding: boolean) => {
    if (generatedCards.length === 0) return;

    const useBranding = applyBranding;
    setIsBranding(useBranding);
    setProgress(0);

    const zip = new JSZip();
    for (let i = 0; i < generatedCards.length; i++) {
        const card = generatedCards[i];
        let cardDataUrl = card.imageUrl;

        if (useBranding) {
            try {
                cardDataUrl = await geminiService.brandCardImage(card.imageUrl, brandLogo, brandName, 'bottom-right');
                if (isLoggedIn && subscription) {
                    setSubscription(prev => {
                        if (!prev) return null;
                        const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                        return newSub;
                    });
                }
            } catch (e: any) {
                console.error(`Failed to brand card for ${card.name}: ${e.message}`);
            }
        }
        
        const response = await fetch(cardDataUrl);
        const blob = await response.blob();
        const safeFileName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        zip.file(`greeting_card_${safeFileName}.png`, blob);
        
        if (useBranding) {
            setProgress(((i + 1) / generatedCards.length) * 100);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'greeting_cards.zip');
    setIsBranding(false);
    setProgress(0);

  }, [generatedCards, brandName, brandLogo, isLoggedIn, subscription]);


  const remainingGenerations = isLoggedIn && subscription 
    ? (subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0)) - subscription.usedInCycle 
    : UNREGISTERED_TRIAL_LIMIT - trialGenerationsUsed;

  const renderContent = () => {
    switch (appState) {
      case 'idle':
        return (
          <div className="space-y-8">
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('csv')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg ${activeTab === 'csv' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        Batch Generate via CSV
                    </button>
                    <button onClick={() => setActiveTab('single')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base sm:text-lg ${activeTab === 'single' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        Generate a Single Image
                    </button>
                </nav>
            </div>
            {activeTab === 'csv' ? (
              isLoggedIn ? (
                <FileUpload onFileSelect={handleFileSelect} disabled={appState !== 'idle'} />
              ) : (
                <TrialGenerator
                    geminiService={geminiService}
                    isOnline={isOnline}
                    onGenerationComplete={handleTrialGeneration}
                    onEditCard={handleEditCard}
                    remainingGenerations={remainingGenerations}
                    onRequestRegister={() => setAuthModal('register')}
                    registeredTrialLimit={REGISTERED_TRIAL_LIMIT}
                 />
              )
            ) : (
              <ImageGenerator 
                geminiService={geminiService} 
                isOnline={isOnline}
                remainingCredits={remainingGenerations}
                onGenerationComplete={() => {
                   if (isLoggedIn && subscription) {
                      setSubscription(prev => {
                        if (!prev) return null;
                        const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                        return newSub;
                      });
                    } else {
                      handleTrialGeneration();
                    }
                }}
              />
            )}
          </div>
        );
      case 'mapping':
        return <ColumnMapper headers={csvHeaders} onMap={handleMap} onCancel={handleCancelMap} fileName={csvFile?.name || ''} />;
      case 'generating':
        return (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Generating Your Cards...</h2>
            <p className="mb-4 text-gray-300">This may take a few moments. Please don't close this window.</p>
            {previewCard && (
                <div className="max-w-sm mx-auto my-4 opacity-50">
                    <p className="text-sm mb-2">First card preview:</p>
                    <GreetingCard card={previewCard} onEdit={() => {}} isPreview={true} />
                </div>
            )}
            <ProgressBar progress={progress} />
            <div className="mt-4">
              <Loader />
            </div>
          </div>
        );
      case 'done':
        return <CardGrid 
            cards={generatedCards} 
            onEditCard={handleEditCard}
            onDownloadAll={handleDownloadAll}
            onReset={handleReset}
            isBranding={isBranding}
            brandingProgress={progress}
            brandName={brandName}
            brandLogo={brandLogo}
            isLoggedIn={isLoggedIn}
            isOnline={isOnline}
         />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans antialiased ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 text-2xl font-bold">
                 {brandingConfig && (
                    <>
                        <span className="text-blue-600 dark:text-blue-400">{brandingConfig.appAccent}</span>
                        <span>{brandingConfig.appName}</span>
                    </>
                 )}
              </div>
            </div>
            <div className="flex items-center gap-2">
                <a href="https://maistermind.com/gengreeting-pricing" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    <UpgradeIcon className="w-5 h-5" />
                    Upgrade Plan
                </a>
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                </button>
                 <button onClick={() => setIsHelpOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <QuestionMarkIcon className="w-6 h-6" />
                </button>
                {isLoggedIn ? (
                    <>
                         <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                             {brandLogo ? <img src={brandLogo} alt="Brand Logo" className="w-6 h-6 rounded-full object-cover" /> : <UserCircleIcon className="w-6 h-6"/>}
                         </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                           <LogoutIcon className="w-6 h-6" />
                           <span className="hidden sm:inline">Logout</span>
                        </button>
                    </>
                ) : (
                    <button onClick={() => setAuthModal('login')} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                       <LoginIcon className="w-6 h-6" />
                       <span className="hidden sm:inline">Login / Register</span>
                    </button>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
           {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <div className="text-sm">{error}</div>
              </div>
            )}
            {isInitializing ? <div className="text-center p-10"><Loader /></div> : renderContent()}
        </div>
      </main>

       {showInstallBanner && <PWAInstallBanner onInstall={handleInstallPrompt} onDismiss={() => setShowInstallBanner(false)} />}
      
      {editingCard && <EditModal card={editingCard} onClose={() => setEditingCard(null)} onSave={handleUpdateCard} geminiService={geminiService} isOnline={isOnline} />}
      {isSettingsOpen && <SettingsModal initialName={brandName} initialLogo={brandLogo} onClose={() => setIsSettingsOpen(false)} onSave={handleSettingsSave} />}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      {isPwaInstallModalOpen && <PwaInstallModal onClose={() => setIsPwaInstallModalOpen(false)} />}
      {isPrivacyOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} customContent={agencyLegal.privacy} />}
      {isTermsOpen && <TermsModal onClose={() => setIsTermsOpen(false)} customContent={agencyLegal.terms} />}
      
      {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onSwitchToRegister={() => setAuthModal('register')} onLoginSuccess={handleLoginSuccess} />}
      {authModal === 'register' && <RegisterModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} onRegisterSuccess={handleRegisterSuccess} couponCodeFromUrl={couponCodeFromUrl} foreverCodeFromUrl={foreverCodeFromUrl} />}

      <Footer 
        onPrivacyClick={() => setIsPrivacyOpen(true)} 
        onTermsClick={() => setIsTermsOpen(true)}
        onDownloadAppClick={() => setIsPwaInstallModalOpen(true)}
      />
    </div>
  );
}

// FIX: Added default export to the App component.
export default App;