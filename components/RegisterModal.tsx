
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon.tsx';
import type { User } from '../types.ts';

interface RegisterModalProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
    onRegisterSuccess: (couponCode: string, foreverCode: string) => void;
    couponCodeFromUrl?: string | null;
    foreverCodeFromUrl?: string | null;
}

const USERS_STORAGE_KEY = 'aigreetings_users';

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin, onRegisterSuccess, couponCodeFromUrl, foreverCodeFromUrl }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [foreverCode, setForeverCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (couponCodeFromUrl) {
            setCouponCode(couponCodeFromUrl);
        }
        if (foreverCodeFromUrl) {
            setForeverCode(foreverCodeFromUrl);
        }
    }, [couponCodeFromUrl, foreverCodeFromUrl]);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }
        
        // Simulate an async API call
        setTimeout(() => {
            try {
                const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

                const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

                if (emailExists) {
                    setError("An account with this email already exists.");
                    setIsLoading(false);
                    return;
                }
                
                // In a real app, you would hash the password here before saving
                const newUser: User = { email: email.toLowerCase(), password };
                users.push(newUser);

                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                
                setIsLoading(false);
                onRegisterSuccess(couponCode, foreverCode);

            } catch (err) {
                setError("An unexpected error occurred during registration.");
                setIsLoading(false);
            }
        }, 750);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Create an Account
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Close registration modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <form onSubmit={handleRegister} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            id="reg-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>
                        <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 !mt-6 !mb-2"></div>

                     <div>
                        <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Bonus Code <span className="text-gray-400">{(couponCodeFromUrl || foreverCodeFromUrl) ? '' : '(Optional)'}</span>
                        </label>
                        <input
                            id="coupon-code"
                            type="text"
                            value={couponCode || foreverCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            readOnly={!!couponCodeFromUrl || !!foreverCodeFromUrl}
                            placeholder="Enter code for bonus credits"
                            className={`
                                mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md
                                ${(!!couponCodeFromUrl || !!foreverCodeFromUrl) && 'bg-green-50 dark:bg-green-900/50 border-green-500 dark:border-green-600 cursor-not-allowed'}
                            `}
                        />
                        {couponCodeFromUrl && (
                            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                Webinar bonus (+1000 credits/mo) has been applied!
                            </p>
                        )}
                        {foreverCodeFromUrl && (
                             <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                Lifetime bonus (+50 credits/mo) has been applied!
                            </p>
                        )}
                    </div>


                    {error && <p className="text-sm text-red-500 text-center !mt-4">{error}</p>}
                    
                    <div className="pt-2 flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <button type="button" onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                Log in here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
