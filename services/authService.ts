import type { User } from '../auth';
import { Buffer } from 'buffer';

const JWT_SESSION_KEY = 'aigreetings_jwt';

/**
 * A generic helper to call our backend API.
 * This is now more specific for each auth action.
 */
const callApi = async (endpoint: string, payload: object) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            // It might be a JSON error object from our API (e.g., { error: "..." })
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `An error occurred at ${endpoint}.`);
        } catch (e) {
            // If parsing fails, it's a plain text/HTML error from the server (e.g., Vercel's error page)
            throw new Error(errorText || `An unknown error occurred at ${endpoint}.`);
        }
    }

    // If response.ok is true, we expect valid JSON.
    return response.json();
};


const login = async (email: string, password: string): Promise<User> => {
    // Calls the new, dedicated /api/login endpoint
    const { user, token } = await callApi('/api/login', { email, password });
    if (!user) { // Token is handled server-side now, but we can check for user object
        throw new Error('Login failed. Please try again.');
    }
    // For client-side session, we'll store the returned user data
    // Assuming the API now returns user data directly upon successful login
    sessionStorage.setItem('aigreetings_user', JSON.stringify(user));
    return user;
};

const register = async (email: string, password: string): Promise<User> => {
    // Calls the new, dedicated /api/register endpoint
    const { user, token } = await callApi('/api/register', { email, password });
     if (!user) {
        throw new Error('Registration failed. Please try again.');
    }
    // Store user data on successful registration
    sessionStorage.setItem('aigreetings_user', JSON.stringify(user));
    return user;
};

const logout = () => {
    // Changed from JWT to a simpler user object storage
    sessionStorage.removeItem('aigreetings_user');
};


/**
 * Gets the current user from session storage.
 * This is now simpler as it just parses a stored user object.
 */
const getCurrentUser = (): User | null => {
    const userStr = sessionStorage.getItem('aigreetings_user');
    if (!userStr) {
        return null;
    }

    try {
        const user = JSON.parse(userStr);
        // Basic validation to ensure it's a user object
        if (user && user.email) {
            return user;
        }
        return null;
    } catch (e) {
        console.error("Failed to parse user from session storage:", e);
        return null;
    }
};


export const authService = {
    login,
    register,
    logout,
    getCurrentUser,
};