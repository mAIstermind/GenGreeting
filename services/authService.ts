import type { User } from '../auth';
import { Buffer } from 'buffer';

const JWT_SESSION_KEY = 'aigreetings_jwt';

/**
 * A generic helper to call our backend API.
 */
const callAuthApi = async (action: string, payload: object) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'An unknown authentication error occurred.');
    }
    return result;
};


const login = async (email: string, password: string): Promise<User> => {
    const { user, token } = await callAuthApi('login', { email, password });
    if (!user || !token) {
        throw new Error('Login failed. Please try again.');
    }
    sessionStorage.setItem(JWT_SESSION_KEY, token);
    return user;
};

const register = async (email: string, password: string): Promise<User> => {
    const { user, token } = await callAuthApi('register', { email, password });
     if (!user || !token) {
        throw new Error('Registration failed. Please try again.');
    }
    sessionStorage.setItem(JWT_SESSION_KEY, token);
    return user;
};

const logout = () => {
    sessionStorage.removeItem(JWT_SESSION_KEY);
};

/**
 * Decodes a Base64URL string.
 */
function base64urlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Gets the current user by decoding the JWT from session storage.
 * This does not verify the token's signature (that's the server's job),
 * but it safely extracts user data for UI purposes and checks for expiry.
 */
const getCurrentUser = (): User | null => {
    const token = sessionStorage.getItem(JWT_SESSION_KEY);
    if (!token) {
        return null;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null; // Invalid token format

        const payload = JSON.parse(base64urlDecode(parts[1]));

        // Check for token expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            logout(); // Clean up expired token
            return null;
        }

        return { email: payload.email };
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null; // Token is malformed or invalid
    }
};


export const authService = {
    login,
    register,
    logout,
    getCurrentUser,
};
