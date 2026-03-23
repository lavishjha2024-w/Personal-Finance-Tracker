import React, { createContext, useState, useEffect } from 'react';
import { supabase, DEV_SUPABASE_DUMMY_REDIRECT } from '../lib/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return undefined;
        }

        const normalizeUser = (authUser) => {
            if (!authUser) return null;
            const username =
                authUser.user_metadata?.username ||
                authUser.email?.split('@')[0] ||
                'User';
            return {
                id: authUser.id,
                username,
                email: authUser.email || '',
            };
        };

        const bootstrap = async () => {
            const { data } = await supabase.auth.getSession();
            const session = data?.session || null;
            setToken(session?.access_token || null);
            setUser(normalizeUser(session?.user || null));
            setLoading(false);
        };

        bootstrap();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setToken(session?.access_token || null);
            setUser(normalizeUser(session?.user || null));
            setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        if (!supabase) {
            throw new Error('Supabase is not configured');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    };

    const signup = async (username, email, password) => {
        if (!supabase) {
            throw new Error('Supabase is not configured');
        }

        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Dev-Supabase-Redirect': DEV_SUPABASE_DUMMY_REDIRECT,
            },
            body: JSON.stringify({ username, email, password }),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = body.details || body.error || 'Signup failed';
            throw new Error(typeof msg === 'string' ? msg : 'Signup failed');
        }

        return login(email, password);
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, supabase }}>
            {children}
        </AuthContext.Provider>
    );
};
