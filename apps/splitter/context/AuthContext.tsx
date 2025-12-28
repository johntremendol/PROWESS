import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isRecovering: boolean;
    setIsRecovering: (value: boolean) => void;
    signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isRecovering: false,
    setIsRecovering: () => { },
    signInWithPassword: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
    resetPassword: async () => ({ error: null }),
    updatePassword: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);

    useEffect(() => {
        // Initial check for recovery hash in case onAuthStateChange already fired
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
            setIsRecovering(true);
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
            // @ts-ignore
        } = supabase.auth.onAuthStateChange((event: string, session: any) => {
            console.log("Auth Event:", event);
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovering(true);
            }

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithPassword = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signUp = async (email: string, password: string) => {
        // Sign up - email confirmation is controlled by Supabase Dashboard settings
        return await supabase.auth.signUp({
            email,
            password,
        });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        // Get redirect URL - use production URL if not localhost
        let redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
        if (redirectTo && !redirectTo.includes('localhost')) {
            redirectTo = 'https://prowess-two.vercel.app/';
        }

        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });
    };

    const updatePassword = async (newPassword: string) => {
        return await supabase.auth.updateUser({
            password: newPassword,
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            isRecovering,
            setIsRecovering,
            signInWithPassword,
            signUp,
            signOut,
            resetPassword,
            updatePassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
