import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

type AuthView = 'signin' | 'signup' | 'forgot' | 'reset';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [view, setView] = useState<AuthView>('signin');
    const { signInWithPassword, signUp, resetPassword, updatePassword, isRecovering, setIsRecovering } = useAuth();

    // Check if we're in password reset mode (from email link or auth event)
    useEffect(() => {
        if (isRecovering) {
            setView('reset');
        } else {
            const hash = window.location.hash;
            if (hash && hash.includes('type=recovery')) {
                setView('reset');
            }
        }
    }, [isRecovering]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            switch (view) {
                case 'signin':
                    if (!email || !password) return;
                    const signInResult = await signInWithPassword(email, password);
                    if (signInResult.error) throw signInResult.error;
                    break;

                case 'signup':
                    if (!email || !password) return;
                    const signUpResult = await signUp(email, password);
                    if (signUpResult.error) throw signUpResult.error;
                    break;

                case 'forgot':
                    if (!email) return;
                    const resetResult = await resetPassword(email);
                    if (resetResult.error) throw resetResult.error;
                    setSuccess('Password reset link sent! Check your email.');
                    break;

                case 'reset':
                    if (!password || !confirmPassword) return;
                    if (password !== confirmPassword) {
                        throw new Error('Passwords do not match');
                    }
                    if (password.length < 6) {
                        throw new Error('Password must be at least 6 characters');
                    }
                    const updateResult = await updatePassword(password);
                    if (updateResult.error) throw updateResult.error;
                    setSuccess('Password updated successfully! You can now sign in.');
                    // Clear the hash and redirect to sign in
                    setIsRecovering(false);
                    window.location.hash = '';
                    setTimeout(() => setView('signin'), 2000);
                    break;
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const switchView = (newView: AuthView) => {
        setView(newView);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-prowess-red/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-display text-5xl text-prowess-beige italic mb-2">PROWESS</h1>
                    <p className="text-label text-xs text-prowess-grey tracking-[0.3em] uppercase">Expense Manager</p>
                </div>

                {/* Tab Toggle - Only show for signin/signup */}
                {(view === 'signin' || view === 'signup') && (
                    <div className="flex mb-8 border-b border-white/10">
                        <button
                            type="button"
                            className={`flex-1 pb-4 text-center text-xs tracking-widest uppercase transition-colors ${view === 'signin' ? 'text-prowess-beige border-b-2 border-prowess-beige' : 'text-prowess-grey hover:text-white'}`}
                            onClick={() => switchView('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`flex-1 pb-4 text-center text-xs tracking-widest uppercase transition-colors ${view === 'signup' ? 'text-prowess-beige border-b-2 border-prowess-beige' : 'text-prowess-grey hover:text-white'}`}
                            onClick={() => switchView('signup')}
                        >
                            Create Account
                        </button>
                    </div>
                )}

                {/* Forgot Password Header */}
                {view === 'forgot' && (
                    <div className="mb-8">
                        <h2 className="text-display text-2xl text-prowess-beige italic mb-2">Reset Password</h2>
                        <p className="text-prowess-grey text-xs">Enter your email to receive a reset link</p>
                    </div>
                )}

                {/* Reset Password Header */}
                {view === 'reset' && (
                    <div className="mb-8">
                        <h2 className="text-display text-2xl text-prowess-beige italic mb-2">New Password</h2>
                        <p className="text-prowess-grey text-xs">Choose a new password for your account</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email - show for signin, signup, forgot */}
                    {(view === 'signin' || view === 'signup' || view === 'forgot') && (
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
                    )}

                    {/* Password - show for signin, signup, reset */}
                    {(view === 'signin' || view === 'signup' || view === 'reset') && (
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-label text-xs text-prowess-grey ml-1 block">
                                {view === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-prowess-beige text-lg placeholder:text-white/20 focus:outline-none focus:border-prowess-beige/50 transition-colors"
                                required
                                minLength={6}
                            />
                            {(view === 'signup' || view === 'reset') && (
                                <p className="text-prowess-grey/50 text-[10px] ml-1">Minimum 6 characters</p>
                            )}
                        </div>
                    )}

                    {/* Confirm Password - show for reset only */}
                    {view === 'reset' && (
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-label text-xs text-prowess-grey ml-1 block">CONFIRM PASSWORD</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-prowess-beige text-lg placeholder:text-white/20 focus:outline-none focus:border-prowess-beige/50 transition-colors"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50">
                            <p className="text-red-400 text-xs text-center">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-3 bg-green-900/20 border border-green-900/50">
                            <p className="text-green-400 text-xs text-center">{success}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-prowess-beige text-black py-4 rounded-none text-label text-sm font-bold tracking-widest uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? 'Processing...'
                            : view === 'signin'
                                ? 'Sign In'
                                : view === 'signup'
                                    ? 'Create Account'
                                    : view === 'forgot'
                                        ? 'Send Reset Link'
                                        : 'Update Password'}
                    </button>
                </form>

                {/* Forgot Password Link - show for signin only */}
                {view === 'signin' && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => switchView('forgot')}
                            className="text-prowess-grey text-xs hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                {/* Back to Sign In - show for forgot and reset */}
                {(view === 'forgot' || view === 'reset') && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => switchView('signin')}
                            className="text-prowess-grey text-xs hover:text-white transition-colors uppercase tracking-wider"
                        >
                            ← Back to Sign In
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-white/20 text-[10px] uppercase tracking-widest">
                        Secure Authentication
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
