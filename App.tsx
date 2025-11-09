
import React, { useState, useEffect, useCallback } from 'react';
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
import { TrialGenerator } from './components/TrialGenerator.tsx';
import { PWAInstallBanner } from './components/PWAInstallBanner.tsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal.tsx';
import { TermsModal } from './components/TermsModal.tsx';
import { CogIcon } from './components/icons/CogIcon.tsx';
import { LoginIcon } from './components/icons/LoginIcon.tsx';
import { LogoutIcon } from './components/icons/LogoutIcon.tsx';
import { QuestionMarkIcon } from './components/icons/QuestionMarkIcon.tsx';
import { UpgradeIcon } from './components/icons/UpgradeIcon.tsx';
import { SunIcon } from './components/icons/SunIcon.tsx';
import { MoonIcon } from './components/icons/MoonIcon.tsx';
import { geminiService } from './services/geminiService.ts';
import type { Contact, GeneratedCard, AgencyConfig } from './types.ts';
import { ImageGenerator } from './components/ImageGenerator.tsx';
import type { BrandingConfig } from './branding.ts';
import { promptTemplates } from './promptTemplates.ts';
import { GreetingCard } from './components/GreetingCard.tsx';
import { UserCircleIcon } from './components/icons/UserCircleIcon.tsx';
import { Footer } from './components/Footer.tsx';

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

const TRIAL_LIMIT = 10;
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
          monthlyLimit: TRIAL_LIMIT, // 10 generations for free trial
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

  const handleMap = (mapping: { name: string; email: string; profileImage: string }, templateId: string) => {
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
          email: mapping.email ? row[mapping.email] || '' : '',
          profileImageUrl: mapping.profileImage ? row[mapping.profileImage] || '' : '',
        })).filter((c: Contact) => c.name);
        
        if (isLoggedIn && subscription) {
            const totalCredits = subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0);
            const remaining = totalCredits - subscription.usedInCycle;
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

        const selectedTemplate = promptTemplates.find(t => t.id === templateId);
        if (!selectedTemplate) {
            setError("The selected image style template could not be found.");
            setAppState('idle');
            return;
        }
        
        const templateRequiresEmail = selectedTemplate.template.includes('${email}');
        if (templateRequiresEmail && !mapping.email) {
            setError(
                <span>
                    The selected image style (<span className="font-semibold">{selectedTemplate.name}</span>) requires an 'email' column, but none was mapped. 
                    Please go back and map the email column or choose a different style.
                </span>
            );
            setAppState('mapping'); // Go back to mapping step to fix it.
            return;
        }


        const newCards: GeneratedCard[] = [];
        const generationErrors: string[] = [];

        for (let i = 0; i < parsedContacts.length; i++) {
          const contact = parsedContacts[i];
          try {
            const firstName = contact.name.split(' ')[0];
            let imagePrompt = selectedTemplate.template.replace(/\${firstName}/g, firstName);

            if (templateRequiresEmail) {
                if (contact.email) {
                    imagePrompt = imagePrompt.replace(/\${email}/g, contact.email);
                } else {
                    generationErrors.push(`- ${contact.name}: Skipped (template requires an email, but none was found in this row).`);
                    setProgress(((i + 1) / parsedContacts.length) * 100);
                    continue;
                }
            }
            
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
  };

  const handleEditSave = (updatedCard: GeneratedCard) => {
    setGeneratedCards(prev => prev.map(c => c.name === updatedCard.name && c.email === updatedCard.email ? updatedCard : c));
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
    const downloadErrors: string[] = [];
    
    if (brandName || brandLogo) {
      if (isLoggedIn && subscription) {
        const totalCredits = subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0);
        const remaining = totalCredits - subscription.usedInCycle;
        if (generatedCards.length > remaining) {
          alert(`Applying branding requires ${generatedCards.length} credits, but you only have ${remaining} left. Please upgrade your plan or download without applying branding.`);
          setIsBranding(false);
          return;
        }
      }
      for (let i = 0; i < cardsToZip.length; i++) {
          try {
            const brandedImageUrl = await geminiService.brandCardImage(cardsToZip[i].imageUrl, brandLogo, brandName, 'bottom-right');
            cardsToZip[i] = { ...cardsToZip[i], imageUrl: brandedImageUrl };
            
             setSubscription(prev => {
                if (!prev) return null;
                const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                return newSub;
              });

          } catch (e) {
            console.error("Failed to brand image for", cardsToZip[i].name);
            downloadErrors.push(cardsToZip[i].name);
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
                downloadErrors.push(card.name);
                continue;
            }
            const blob = await response.blob();
            const safeFileName = card.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`greeting_card_${safeFileName}.png`, blob);
        } catch (err) {
            console.error(`Error processing or adding card for ${card.name} to zip:`, err);
            downloadErrors.push(card.name);
        } finally {
            setProgress(50 + (((i + 1) / cardsToZip.length) * 50));
        }
    }

    if (downloadErrors.length > 0) {
        alert(`Could not include cards for the following contacts in the ZIP file: ${[...new Set(downloadErrors)].join(', ')}. Please check your connection or try downloading them individually.`);
    }

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
      saveAs(content, 'greeting_cards.zip');
      setIsBranding(false);
      setProgress(0);
    });
  };
  
  const renderLoggedInContent = () => {
    const totalCredits = subscription ? (subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0)) : 0;
    const remainingCredits = subscription ? (totalCredits - subscription.usedInCycle) : 0;
    const isDisabled = appState !== 'idle' || !isOnline;

    const CSV_CONTENT = (
        <>
            {(() => {
                switch (appState) {
                    case 'idle':
                        return (
                            <>
                                <div className="text-center max-w-3xl mx-auto mb-10">
                                    <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                                        Create Personalized Cards in Bulk
                                    </h2>
                                    <p className="mt-4 text-xl text-gray-400">
                                        Upload a CSV with your contact list, choose a style, and let AI generate a unique visual for every person. Perfect for outreach, event invites, and holiday greetings.
                                    </p>
                                </div>
                                <FileUpload onFileSelect={handleFileSelect} disabled={isDisabled} />
                            </>
                        );
                    case 'mapping':
                        return <ColumnMapper headers={csvHeaders} onMap={handleMap} onCancel={handleCancelMap} fileName={csvFile?.name || ''} />;
                    case 'generating':
                        return (
                        <div className="w-full max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">Generating Your Cards...</h2>
                            <p className="text-gray-300 mb-8">This can take a few moments. Feel free to watch the progress.</p>
                            
                            {previewCard && (
                                <div className="mb-8 max-w-xs mx-auto animate-fade-in">
                                    <p className="text-sm text-gray-400 mb-2">First card preview:</p>
                                    <div className="pointer-events-none">
                                        <GreetingCard card={previewCard} onEdit={() => {}} isPreview={true} />
                                    </div>
                                    <style>{`
                                        @keyframes fade-in {
                                            from { opacity: 0; transform: scale(0.95); }
                                            to { opacity: 1; transform: scale(1); }
                                        }
                                        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                                    `}</style>
                                </div>
                            )}

                            <ProgressBar progress={progress} />
                            <p className="mt-2 text-sm text-gray-400">{generatedCards.length} of {contacts.length} cards generated.</p>
                        </div>
                        );
                    case 'done':
                        return (
                            <CardGrid
                                cards={generatedCards}
                                onEditCard={(card) => setEditingCard(card)}
                                onDownloadAll={handleDownloadAll}
                                onReset={handleReset}
                                isBranding={isBranding}
                                brandingProgress={isBranding ? progress : 0}
                                brandName={brandName}
                                brandLogo={brandLogo}
                                isLoggedIn={isLoggedIn}
                                isOnline={isOnline}
                            />
                        );
                    default:
                        return null;
                }
            })()}
        </>
    );
     const TABS = {
        csv: {
            name: 'Batch Generate via CSV',
            content: CSV_CONTENT,
        },
        single: {
            name: 'Generate with Imagen',
            content: <ImageGenerator 
                geminiService={geminiService} 
                isOnline={isOnline} 
                remainingCredits={remainingCredits}
                onGenerationComplete={() => {
                    if (isLoggedIn && subscription) {
                        setSubscription(prev => {
                        if (!prev) return null;
                        const newSub = { ...prev, usedInCycle: prev.usedInCycle + 1 };
                        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
                        return newSub;
                        });
                    }
                }}
            />,
        }
    };
    return (
        <>
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
            {TABS[activeTab].content}
        </>
    );
  };

  const renderLoggedOutContent = () => {
     const remainingGenerations = 1 - trialGenerationsUsed;

    if (remainingGenerations <= 0) {
        return (
            <div className="text-center bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
                You've used your one free generation.
            </h2>
            <p className="text-gray-300 mb-6">
                To continue generating, please register for a free account to get 10 more generations and unlock batch CSV uploads.
            </p>
             <button
                onClick={() => setAuthModal('register')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
                Register for Free
            </button>
            </div>
        );
    }

    return <TrialGenerator 
        geminiService={geminiService}
        isOnline={isOnline}
        onGenerationComplete={handleTrialGeneration}
        onEditCard={(card) => setEditingCard(card)}
        remainingGenerations={remainingGenerations}
     />;
  };

  if (!brandingConfig || isInitializing) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-800 dark:text-white">
            <svg className="animate-spin h-10 w-10 text-gray-600 dark:text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading application...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans flex flex-col">
      <header className="py-4 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {brandingConfig.logo && <img src={brandingConfig.logo} alt="Brand Logo" className="h-8 w-8 object-contain rounded-md" />}
            <h1 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">{brandingConfig.appAccent}</span>{brandingConfig.appName}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && subscription && (
              <div className="hidden sm:flex items-center gap-3 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg">
                <div className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">{(subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0)) - subscription.usedInCycle}</span>
                    <span className="text-gray-500 dark:text-gray-400"> / {subscription.monthlyLimit + (subscription.bonusCredits || 0) + (subscription.foreverBonus || 0)} credits left</span>
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
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            {isLoggedIn ? (
              <>
                 <button
                  onClick={() => setIsHelpOpen(true)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
                  aria-label="Help"
                >
                  <QuestionMarkIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
                  aria-label="Settings"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors"
                  aria-label="Logout"
                >
                  <LogoutIcon className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModal('login')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <LoginIcon className="w-5 h-5" />
                Login / Register
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!isOnline && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-8 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-600" role="alert">
              <p className="font-bold">You are currently offline.</p>
              <p>Some features, like image generation, may be unavailable.</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600" role="alert">
              <p className="font-bold">An Error Occurred</p>
              <div className="text-sm">{error}</div>
            </div>
          )}
          
          {isLoggedIn ? renderLoggedInContent() : renderLoggedOutContent()}
        </div>
      </main>
      
      <Footer onPrivacyClick={() => setIsPrivacyOpen(true)} onTermsClick={() => setIsTermsOpen(true)} />

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
          onRegisterSuccess={handleRegisterSuccess}
          couponCodeFromUrl={couponCodeFromUrl}
          foreverCodeFromUrl={foreverCodeFromUrl}
        />
      )}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      {isPrivacyOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} customContent={agencyLegal.privacy} />}
      {isTermsOpen && <TermsModal onClose={() => setIsTermsOpen(false)} customContent={agencyLegal.terms} />}
      {showInstallBanner && (
        <PWAInstallBanner 
            onInstall={handleInstallPrompt}
            onDismiss={() => setShowInstallBanner(false)}
        />
      )}
    </div>
  );
}

export default App;