

import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { LoginIcon } from './icons/LoginIcon';
import type { User } from '../types';

interface LoginModalProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
    onLoginSuccess: () => void;
}

const USERS_STORAGE_KEY = 'aigreetings_users';

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Simulate an async API call
        setTimeout(() => {
            try {
                const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
                
                const foundUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
                
                // In a real app, you would compare hashed passwords securely on a server
                if (foundUser && foundUser.password === password) {
                    setIsLoading(false);
                    onLoginSuccess();
                } else {
                    setError("Invalid email or password. Please try again.");
                    setIsLoading(false);
                }

            } catch (err) {
                setError("An unexpected error occurred during login.");
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Login</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Close login modal">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                
                <form onSubmit={handleLogin} className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    
                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <LoginIcon className="w-5 h-5"/>
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                         <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <button type="button" onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                Register here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};