import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signInWithEmail } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await signInWithEmail(email);
            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to send magic link');
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
                    We've sent a magic link to <span className="text-white">{email}</span>. Click it to log in.
                </p>
                <button
                    onClick={() => setSent(false)}
                    className="mt-8 text-label text-xs text-prowess-red hover:text-white transition-colors uppercase tracking-widest"
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
                <div className="mb-12 text-center">
                    <h1 className="text-display text-5xl text-prowess-beige italic mb-2">PROWESS</h1>
                    <p className="text-label text-xs text-prowess-grey tracking-[0.3em] uppercase">Expense Manager</p>
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
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-prowess-beige text-lg placeholder:text-white/20 focus:outline-none focus:border-prowess-beige/50 transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                            <p className="text-red-400 text-xs text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-prowess-beige text-black py-4 rounded-lg text-label text-sm font-bold tracking-widest uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>

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
