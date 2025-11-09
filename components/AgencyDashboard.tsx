

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AgencyConfig } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { UploadIcon } from './icons/UploadIcon';
import { LoginIcon } from './icons/LoginIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

const AGENCY_CONFIG_KEY = 'aigreetings_agency_config';
const AGENCY_AUTH_KEY = 'aigreetings_agency_auth';

const defaultAgencyConfig: AgencyConfig = {
    appName: 'Greetings',
    appAccent: 'AI',
    logo: null,
    apiKey: '',
    cnameDomain: '',
    plans: {
        pro: { name: 'Pro', limit: 500 },
        business: { name: 'Business', limit: 2500 },
        agency: { name: 'Agency', limit: 10000 },
    },
    privacyPolicy: '',
    termsAndConditions: '',
};

// --- START: Agency Help Guide Components ---
const GuideContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300 space-y-4">
        {children}
    </div>
);
const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-white border-b border-gray-600 pb-2 mb-4">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold text-blue-400 mt-6 mb-2">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="leading-relaxed">{children}</p>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 pl-4">{children}</ul>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-gray-700 text-sm text-yellow-300 rounded-md px-2 py-1 font-mono">{children}</code>;

const AgencyGuide = () => (
     <GuideContent>
        <H2>Agency & Implementation Guide</H2>
        <H3>1. Deployment</H3>
        <P>Follow these steps to deploy your own instance of the application.</P>
        <UL>
            <LI><Strong>Prerequisites:</Strong> A static website host (Vercel, Netlify) and a Google Gemini API Key.</LI>
            <LI><Strong>API Key Config:</Strong> The Gemini API key must be set as an environment variable named <Code>GEMINI_API_KEY</Code> in your hosting provider's settings. Do not hardcode the key.</LI>
            <LI><Strong>Deployment:</Strong> Upload all application files to your host. Since it's a static app, no build step is needed. Just serve the <Code>index.html</Code> file.</LI>
        </UL>

        <H3>2. Connecting a Custom Domain (Recommended)</H3>
        <P>Once deployed, serve the app from your own domain. The <Strong>subdomain approach</Strong> (e.g., <Code>app.yourdomain.com</Code>) is highly recommended for its simplicity and reliability.</P>
        <P>For detailed instructions, please refer to the <Code>DEPLOYMENT_OPTIONS.md</Code> file included in the project source code.</P>

        <H3>3. Whitelabel Customization</H3>
        <P>Easily rebrand the application for your agency. All settings on this dashboard are saved to the user's browser <Code>localStorage</Code>. When a user visits your app, it will load this configuration to whitelabel the experience.</P>
        <P><Strong>IMPORTANT:</Strong> To provide your users with the whitelabeled experience, you must link them to the application with a special URL parameter that points to a configuration file you host. This is a more robust method than relying on localStorage alone for all your users.</P>
        
        <H3>4. GHL Funnel Integration</H3>
        <P>The project includes three pre-built HTML files for a GHL funnel: <Code>ghl-landing-page.html</Code>, <Code>ghl-pricing-page.html</Code>, and <Code>ghl-thank-you-page.html</Code>. These are for your end-users.</P>
        <UL>
            <LI><Strong>Implementation:</Strong> In your GHL funnel builder, copy the content from the HTML files into custom HTML blocks on each respective page.</LI>
            <LI><Strong>Crucial:</Strong> Find all comments marked <Code>&lt;!-- NOTE FOR GHL USER: ... --&gt;</Code> and replace placeholder links (<Code>href="#"</Code>) with your actual GHL form links, checkout pages, etc.</LI>
            <LI><Strong>Link Your App:</Strong> On the "Thank You" page in GHL, edit the "Go to the App" button to link to the public URL of your deployed application.</LI>
        </UL>

        <H3>5. Agency Whitelabel Sales Pages</H3>
        <P>This project also includes pre-built HTML templates for selling this entire application to other agencies. You can view them here. These are designed to be imported into your own marketing platform (like GHL).</P>
        <UL>
            <LI><a href="/agency-sales-page.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Sales Page</a></LI>
            <LI><a href="/agency-pricing-page.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Pricing Page</a></LI>
            <LI><a href="/agency-onboarding-thank-you.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">View Agency Onboarding Page</a></LI>
        </UL>
    </GuideContent>
);

const AgencyHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <div className="relative w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">Agency Help & Guide</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close help modal">
                    <CloseIcon className="w-7 h-7"/>
                </button>
            </div>
            <div className="p-6 overflow-y-auto">
                <AgencyGuide />
            </div>
             <div className="p-4 flex justify-end gap-4 border-t border-gray-700 flex-shrink-0">
                <button onClick={onClose} className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Close
                </button>
            </div>
        </div>
    </div>
);
// --- END: Agency Help Guide Components ---


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const AgencyDashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    
    const [config, setConfig] = useState<AgencyConfig>(defaultAgencyConfig);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [logoError, setLogoError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check for session-based login
        if (sessionStorage.getItem(AGENCY_AUTH_KEY) === 'true') {
            setIsLoggedIn(true);
        }

        // Load existing config from local storage
        try {
            const storedConfig = localStorage.getItem(AGENCY_CONFIG_KEY);
            if (storedConfig) {
                const parsedConfig = JSON.parse(storedConfig);
                // Merge with defaults to ensure all keys are present
                setConfig(prev => ({...prev, ...parsedConfig}));
            }
        } catch (e) {
            console.error("Failed to load agency config", e);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // This is a simple, simulated password check.
        // In a real application, this would be a secure backend authentication call.
        setTimeout(() => {
            if (password === 'admin123') {
                sessionStorage.setItem(AGENCY_AUTH_KEY, 'true');
                setIsLoggedIn(true);
                setLoginError('');
            } else {
                setLoginError('Incorrect password.');
            }
            setIsLoading(false);
        }, 500);
    };
    
    const handleValueChange = (section: keyof AgencyConfig, value: any) => {
        setConfig(prev => ({ ...prev, [section]: value }));
    };

    const handlePlanChange = (plan: 'pro' | 'business' | 'agency', field: 'name' | 'limit', value: string | number) => {
        setConfig(prev => ({
            ...prev,
            plans: {
                ...prev.plans,
                [plan]: {
                    ...prev.plans[plan],
                    [field]: field === 'limit' ? Number(value) : value,
                }
            }
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { // 1MB limit for logo
                setLogoError('Image size must be less than 1MB.');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setLogoError('Please upload a JPG, PNG, or WEBP image.');
                return;
            }
            setLogoError('');
            const base64 = await fileToBase64(file);
            handleValueChange('logo', base64);
        }
    };

    const handleSave = () => {
        setSaveStatus('saving');
        try {
            localStorage.setItem(AGENCY_CONFIG_KEY, JSON.stringify(config));
            setSaveStatus('success');
        } catch (e) {
            console.error("Failed to save config:", e);
            setSaveStatus('error');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };
    
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <form onSubmit={handleLogin} className="bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-700">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white">Agency Dashboard</h1>
                            <p className="text-gray-400 mt-2">Please log in to continue.</p>
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            />
                        </div>
                        {loginError && <p className="text-sm text-red-400 text-center">{loginError}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500"
                        >
                            <LoginIcon className="w-5 h-5"/>
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {isHelpOpen && <AgencyHelpModal onClose={() => setIsHelpOpen(false)} />}
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto py-4 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Agency Whitelabel Dashboard</h1>
                        <button onClick={() => setIsHelpOpen(true)} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
                            <QuestionMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                     <button
                        onClick={handleSave}
                        disabled={saveStatus !== 'idle'}
                        className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
                    >
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'success' && 'Saved!'}
                        {saveStatus === 'error' && 'Error!'}
                        {saveStatus === 'idle' && 'Save Configuration'}
                    </button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto py-8 px-6 space-y-8">
                
                {/* Branding Section */}
                <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Branding</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="appAccent" className="block text-sm font-medium text-gray-300">App Name Accent</label>
                                <input id="appAccent" type="text" value={config.appAccent} onChange={e => handleValueChange('appAccent', e.target.value)} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white" />
                                <p className="text-xs text-gray-400 mt-1">The colored portion of the name (e.g., "AI").</p>
                            </div>
                             <div>
                                <label htmlFor="appName" className="block text-sm font-medium text-gray-300">App Name</label>
                                <input id="appName" type="text" value={config.appName} onChange={e => handleValueChange('appName', e.target.value)} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white" />
                                <p className="text-xs text-gray-400 mt-1">The main part of the name (e.g., "Greetings").</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Your Logo</label>
                             <div className="mt-1 flex items-center gap-4">
                                <div className="w-20 h-20 rounded-md bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-600">
                                    {config.logo ? <img src={config.logo} alt="Logo" className="w-full h-full object-cover"/> : <UploadIcon className="w-8 h-8 text-gray-400"/>}
                                </div>
                                <div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 border border-gray-500 text-sm rounded-md hover:bg-gray-700">Upload Image</button>
                                    {config.logo && <button type="button" onClick={() => handleValueChange('logo', null)} className="ml-2 text-sm text-red-400">Remove</button>}
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 1MB.</p>
                                    {logoError && <p className="text-sm text-red-400 mt-1">{logoError}</p>}
                                </div>
                                <input ref={fileInputRef} type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* API Key Section */}
                <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-2">API Configuration</h2>
                    <p className="text-sm text-gray-400 mb-4">This key will be used for all image generations for your end-users.</p>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">Google Gemini API Key</label>
                        <input id="apiKey" type="password" value={config.apiKey} onChange={e => handleValueChange('apiKey', e.target.value)} placeholder="Enter your Gemini API key" className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white" />
                    </div>
                </section>

                 {/* Plan Configuration Section */}
                <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Plan Configuration</h2>
                    <p className="text-sm text-gray-400 mb-4">Set the credit limits for the subscription plans your users can choose.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.keys(config.plans).map(planKey => (
                            <div key={planKey} className="bg-gray-900/50 p-4 rounded-md">
                                <h3 className="font-semibold text-lg capitalize text-blue-400">{planKey} Plan</h3>
                                <div className="mt-2">
                                    <label htmlFor={`${planKey}-name`} className="block text-xs font-medium text-gray-400">Display Name</label>
                                    <input id={`${planKey}-name`} type="text" value={config.plans[planKey as keyof typeof config.plans].name} onChange={e => handlePlanChange(planKey as any, 'name', e.target.value)} className="mt-1 w-full text-sm bg-gray-700 border-gray-600 rounded-md text-white" />
                                </div>
                                <div className="mt-2">
                                    <label htmlFor={`${planKey}-limit`} className="block text-xs font-medium text-gray-400">Monthly Credit Limit</label>
                                    <input id={`${planKey}-limit`} type="number" value={config.plans[planKey as keyof typeof config.plans].limit} onChange={e => handlePlanChange(planKey as any, 'limit', e.target.value)} className="mt-1 w-full text-sm bg-gray-700 border-gray-600 rounded-md text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Legal Section */}
                <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Legal & Compliance</h2>
                    <p className="text-sm text-gray-400 mb-4">As the service provider for your clients, you must provide your own legal documents. The content you enter here will be displayed to your end-users.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="terms" className="block text-sm font-medium text-gray-300">Terms & Conditions</label>
                            <textarea id="terms" value={config.termsAndConditions} onChange={e => handleValueChange('termsAndConditions', e.target.value)} rows={8} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white font-mono text-sm" placeholder="Paste your Terms & Conditions text here."></textarea>
                        </div>
                        <div>
                            <label htmlFor="privacy" className="block text-sm font-medium text-gray-300">Privacy Policy</label>
                            <textarea id="privacy" value={config.privacyPolicy} onChange={e => handleValueChange('privacyPolicy', e.target.value)} rows={8} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white font-mono text-sm" placeholder="Paste your Privacy Policy text here."></textarea>
                        </div>
                    </div>
                </section>
                
                 {/* Domain Section */}
                <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Custom Domain (CNAME)</h2>
                    <p className="text-sm text-gray-400 mb-4">To serve this application from your own domain (e.g., <code className="text-xs bg-gray-700 p-1 rounded">app.youragency.com</code>), follow your hosting provider's instructions to point a CNAME record to your deployment URL.</p>
                     <div>
                        <label htmlFor="cnameDomain" className="block text-sm font-medium text-gray-300">Your Custom Domain</label>
                        <input id="cnameDomain" type="text" value={config.cnameDomain} onChange={e => handleValueChange('cnameDomain', e.target.value)} placeholder="app.youragency.com" className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white" />
                        <p className="text-xs text-gray-400 mt-1">This is for your reference and does not automatically configure the domain.</p>
                    </div>
                </section>

            </main>
        </div>
    );
};