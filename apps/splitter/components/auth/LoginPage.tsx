import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');
    const [isSignUp, setIsSignUp] = useState(false);
    const { signInWithEmail, signInWithPassword, signUp } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        if (authMethod === 'password' && !password) return;

        setLoading(true);
        setError(null);

        try {
            if (authMethod === 'magic') {
                const { error } = await signInWithEmail(email);
                if (error) throw error;
                setSent(true);
            } else {
                if (isSignUp) {
                    const { error } = await signUp(email, password);
                    if (error) throw error;
                    setSent(true);
                } else {
                    const { error } = await signInWithPassword(email, password);
                    if (error) throw error;
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full border border-prowess-beige mb-6 flex items-center justify-center text-prowess-beige text-2xl animate-pulse">
                    ✉️
                </div>
                <h1 className="text-display text-3xl text-prowess-beige italic mb-4">Check your email</h1>
                <p className="text-label text-sm text-prowess-grey max-w-xs mx-auto">
                    {authMethod === 'magic' ? (
                        <>We've sent a magic link to <span className="text-white">{email}</span>. Click it to log in.</>
                    ) : (
                        <>We've sent a confirmation email to <span className="text-white">{email}</span>. Please verify your account.</>
                    )}
                </p>
                <button
                    onClick={() => setSent(false)}
                    className="mt-8 text-label text-xs text-prowess-red hover:text-white transition-colors uppercase tracking-widest rounded-none"
                >
                    Try a different email
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-prowess-red/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-display text-5xl text-prowess-beige italic mb-2">PROWESS</h1>
                    <p className="text-label text-xs text-prowess-grey tracking-[0.3em] uppercase">Expense Manager</p>
                </div>

                <div className="flex mb-8 border-b border-white/10">
                    <button
                        className={`flex-1 pb-4 text-center text-xs tracking-widest uppercase transition-colors ${authMethod === 'magic' ? 'text-prowess-beige border-b border-prowess-beige' : 'text-prowess-grey hover:text-white'}`}
                        onClick={() => setAuthMethod('magic')}
                    >
                        Magic Link
                    </button>
                    <button
                        className={`flex-1 pb-4 text-center text-xs tracking-widest uppercase transition-colors ${authMethod === 'password' ? 'text-prowess-beige border-b border-prowess-beige' : 'text-prowess-grey hover:text-white'}`}
                        onClick={() => setAuthMethod('password')}
                    >
                        Password
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-label text-xs text-prowess-grey ml-1 block">EMAIL ADDRESS</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-prowess-beige text-lg placeholder:text-white/20 focus:outline-none focus:border-prowess-beige/50 transition-colors"
                            required
                        />
                    </div>

                    {authMethod === 'password' && (
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-label text-xs text-prowess-grey ml-1 block">PASSWORD</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-prowess-beige text-lg placeholder:text-white/20 focus:outline-none focus:border-prowess-beige/50 transition-colors"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                            <p className="text-red-400 text-xs text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-prowess-beige text-black py-4 rounded-none text-label text-sm font-bold tracking-widest uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? 'Processing...'
                            : authMethod === 'magic'
                                ? 'Send Magic Link'
                                : isSignUp
                                    ? 'Create Account'
                                    : 'Sign In'}
                    </button>
                </form>

                {authMethod === 'password' && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-prowess-grey text-xs hover:text-white transition-colors uppercase tracking-wider"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create Password'}
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-white/20 text-[10px] uppercase tracking-widest">
                        Protected by Supabase Auth
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
