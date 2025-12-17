import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithEmail: (email: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithEmail: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string) => {
        // Magic link login
        // Redirect to the current URL after login, but force production URL if not localhost
        let redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
        if (redirectTo && !redirectTo.includes('localhost')) {
            redirectTo = 'https://prowess-two.vercel.app/';
        }

        return await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo,
            },
        });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
