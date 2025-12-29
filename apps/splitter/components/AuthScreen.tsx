import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

const AuthScreen = () => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in with Google');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-prowess-red/20 via-black to-black pointer-events-none" />

            <div className="z-10 w-full max-w-md flex flex-col items-center text-center space-y-12">
                {/* Logo / Branding */}
                <div className="space-y-4">
                    <h1 className="text-display text-6xl text-prowess-beige italic tracking-tight">
                        Splitter
                    </h1>
                    <p className="text-label text-xs text-prowess-grey tracking-[0.2em] uppercase">
                        Expense Sharing Evolved
                    </p>
                </div>

                {/* Login Action */}
                <div className="w-full space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full h-[56px] flex items-center justify-center gap-3 bg-white text-black hover:bg-prowess-beige transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-prowess-red/0 group-hover:bg-prowess-red/5 transition-colors" />

                        {/* Google Icon SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>

                        <span className="text-label text-sm font-bold tracking-widest uppercase">
                            {loading ? 'Please Wait...' : 'Sign in with Google'}
                        </span>
                    </button>

                    <p className="text-label text-xs text-prowess-grey/50 tracking-widest uppercase">
                        Powered by Prowess
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
