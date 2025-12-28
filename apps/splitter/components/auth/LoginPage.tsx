import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SwipeCarousel from '../SwipeCarousel';
import { Eye, EyeOff } from 'lucide-react';

// Assets
import splitterLogo from '../../../../src/assets/splitterlogo.png';
const bannerPNG = '/assets/login_banner.png'; // Updated to the new banner

type AuthView = 'signin' | 'signup' | 'forgot' | 'reset';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [view, setView] = useState<AuthView>('signin');
    const { signInWithPassword, signUp, resetPassword, updatePassword, isRecovering, setIsRecovering } = useAuth();

    // Check if we're in password reset/invite mode
    useEffect(() => {
        const hash = window.location.hash;
        if (isRecovering || hash.includes('type=recovery') || hash.includes('type=invite')) {
            setView('reset');
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
                    setSuccess('Reset link sent! Check your email.');
                    break;

                case 'reset':
                    if (!password || !confirmPassword) return;
                    if (password !== confirmPassword) throw new Error('Passwords do not match');
                    if (password.length < 6) throw new Error('Password must be at least 6 characters');

                    const updateResult = await updatePassword(password);
                    if (updateResult.error) throw updateResult.error;

                    setSuccess('Success! Signing you in...');
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

    // Tabs for SwipeCarousel
    const tabs = [
        {
            id: 'signup',
            label: 'SIGN UP',
            content: (
                <form onSubmit={handleSubmit} className="space-y-12 px-6 py-12">
                    <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                        <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] pb-1 uppercase">EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="placeholder@aa.co"
                            className="bg-transparent text-right text-display text-[40px] text-prowess-beige italic focus:outline-none placeholder:text-prowess-grey/20 flex-1 ml-4"
                            required
                        />
                    </div>
                    <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                        <div className="flex items-center gap-2 pb-1">
                            <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] uppercase">CREATE KEY</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-prowess-grey opacity-50 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="0000000"
                            className="bg-transparent text-right text-display text-[40px] text-prowess-grey focus:outline-none placeholder:text-prowess-grey/20 flex-1 ml-4"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 py-4 bg-prowess-red text-black text-label text-[15px] font-bold tracking-[0.16em] uppercase hover:bg-prowess-beige transition-colors disabled:opacity-40"
                    >
                        {loading ? 'PROCESSING...' : 'CREATE ACCOUNT'}
                    </button>
                    <div className="pt-8 text-left">
                        <button
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-[16px] text-prowess-grey tracking-[0.14em] hover:text-prowess-beige transition-colors font-['Optician_Sans']"
                            style={{ textTransform: 'lowercase' }}
                        >
                            regain access ?
                        </button>
                    </div>
                </form>
            )
        },
        {
            id: 'signin',
            label: 'LOGIN',
            content: (
                <form onSubmit={handleSubmit} className="space-y-12 px-6 py-12">
                    <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                        <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] pb-1 uppercase">EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="placeholder@aa.co"
                            className="bg-transparent text-right text-display text-4xl text-prowess-beige italic focus:outline-none placeholder:text-prowess-grey/20 flex-1 ml-4"
                            required
                        />
                    </div>
                    <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                        <div className="flex items-center gap-2 pb-1">
                            <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] uppercase">KEY</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-prowess-grey opacity-50 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="0000000"
                            className="bg-transparent text-right text-display text-4xl text-prowess-grey focus:outline-none placeholder:text-prowess-grey/20 flex-1 ml-4"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 py-4 bg-prowess-red text-black text-label text-[15px] font-bold tracking-[0.16em] uppercase hover:bg-prowess-beige transition-colors disabled:opacity-40"
                    >
                        {loading ? 'PROCESSING...' : 'ENTER APP'}
                    </button>
                    <div className="pt-8 text-left">
                        <button
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-label text-[16px] text-prowess-grey tracking-[0.14em] normal-case hover:text-prowess-beige transition-colors lowercase font-['Optician_Sans']"
                            style={{ textTransform: 'lowercase' }}
                        >
                            regain access ?
                        </button>
                    </div>
                </form>
            )
        }
    ];

    // Special view for Reset Password (Invite/Recovery)
    if (view === 'reset') {
        const isInvite = window.location.hash.includes('type=invite');
        return (
            <div className="min-h-screen bg-black flex flex-col items-center">
                <div className="w-full h-[302px] relative overflow-hidden">
                    <img src={bannerPNG} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img src={splitterLogo} alt="S" className="h-[210px] object-contain" />
                    </div>
                </div>

                <div className="w-full max-w-md px-6 py-12 space-y-8 animate-fade-in text-center">
                    <div>
                        <h2 className="text-display text-3xl text-prowess-beige italic mb-2">
                            {isInvite ? 'Join Group' : 'New Key'}
                        </h2>
                        <p className="text-prowess-grey text-xs uppercase tracking-[0.2em]">
                            {isInvite ? 'Set a password to enter' : 'Reset your access key'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12 text-left px-4">
                        <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                            <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] pb-1 uppercase">NEW KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent text-right text-display text-4xl text-prowess-beige focus:outline-none flex-1 ml-4"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                            <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] pb-1 uppercase">CONFIRM</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-transparent text-right text-display text-4xl text-prowess-beige focus:outline-none flex-1 ml-4"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
                        {success && <p className="text-green-500 text-xs italic text-center">{success}</p>}
                        <button type="submit" disabled={loading} className="w-full py-4 bg-prowess-red text-black text-label text-[15px] font-bold tracking-[0.16em] uppercase hover:bg-prowess-beige transition-colors">
                            {loading ? 'SAVING...' : isInvite ? 'SET KEY & JOIN' : 'UPDATE KEY'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Special view for Forgot Password
    if (view === 'forgot') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-md space-y-12 animate-fade-in text-center">
                    <div>
                        <h2 className="text-display text-4xl text-prowess-beige italic mb-4">Regain Access</h2>
                        <p className="text-prowess-grey text-xs uppercase tracking-[0.2em]">Recovery link will be sent</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-12 text-left">
                        <div className="flex justify-between items-end border-b border-prowess-red pb-2 hover:border-white transition-colors group">
                            <label className="text-label text-[10px] text-prowess-grey tracking-[0.34em] pb-1 uppercase">EMAIL</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="placeholder@aa.co"
                                className="bg-transparent text-right text-display text-4xl text-prowess-beige italic focus:outline-none placeholder:text-prowess-grey/20 flex-1 ml-4"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}
                        {success && <p className="text-green-500 text-xs italic text-center">{success}</p>}
                        <button type="submit" disabled={loading} className="w-full py-4 bg-prowess-red text-black text-label text-[15px] font-bold tracking-[0.16em] uppercase hover:bg-prowess-beige transition-colors">
                            {loading ? 'SENDING...' : 'SEND LINK'}
                        </button>
                        <button type="button" onClick={() => setView('signin')} className="text-label text-[16px] text-prowess-grey hover:text-white block mx-auto pt-8 normal-case lowercase" style={{ textTransform: 'lowercase' }}>
                            ← back to login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main View
    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-0">
            {/* Header / Banner - Clean, no gradient */}
            <div className="w-full h-[302px] relative overflow-hidden">
                <img
                    src={bannerPNG}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={splitterLogo}
                        alt="S"
                        className="h-[210px] object-contain"
                    />
                </div>
            </div>

            {/* Draggable Switcher Area */}
            <div className="w-full max-w-md flex-1 flex flex-col pt-8">
                <SwipeCarousel tabs={tabs} className="flex-1" />
            </div>

            {/* Footer */}
            <div className="pb-12 text-center opacity-20">
                <p className="text-label text-[10px] tracking-[0.4em]">PROWESS SECURE</p>
            </div>
        </div>
    );
};

export default LoginPage;
