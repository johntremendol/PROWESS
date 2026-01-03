import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../../lib/supabase';
import { Group } from '../../../../types';
import Avatar from '../Avatar';
import { Eye, EyeOff } from 'lucide-react';

interface AccountViewProps {
    onClose: () => void;
    groups: Group[]; // Added groups prop for analytics
}

const AccountView: React.FC<AccountViewProps> = ({ onClose, groups }) => {
    const { user, signOut } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Analytics Calculation
    const stats = useMemo(() => {
        if (!user || !user.email) return { groupsLength: 0, totalSpentByCurrency: {} as Record<string, number> };

        const currencyTotals: Record<string, number> = {};

        groups.forEach(group => {
            // Find member in this group corresponding to the logged-in user
            const member = group.members.find(m => m.email === user.email);
            if (!member) return;

            group.expenses.forEach(expense => {
                let amount = 0;
                if (Array.isArray(expense.paidBy)) {
                    // Multi-payer
                    const contribution = expense.paidBy.find(p => p.memberId === member.id);
                    if (contribution) amount = contribution.amount;
                } else {
                    // Single payer
                    if (expense.paidBy === member.id) amount = expense.amount;
                }

                if (amount > 0) {
                    const code = group.currency || '$';
                    currencyTotals[code] = (currencyTotals[code] || 0) + amount;
                }
            });
        });

        return {
            groupsLength: groups.length,
            totalSpentByCurrency: currencyTotals
        };
    }, [groups, user]);

    const handleUpdatePassword = async () => {
        if (!newPassword) return;
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords don't match" });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: "Password updated successfully" });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error("Error updating password:", err);
            setMessage({ type: 'error', text: err.message || "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-full bg-black overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-prowess-grey/20">
                <h2 className="text-display text-xl text-prowess-beige italic">Account</h2>
                <button
                    onClick={onClose}
                    className="text-label text-xs text-prowess-grey hover:text-white uppercase tracking-widest"
                >
                    Close
                </button>
            </div>

            <div className="flex-1 px-6 pb-6">

                {/* Profile Section */}
                <div className="flex flex-col items-center py-10 space-y-4">
                    <Avatar
                        name={user.email || 'U'}
                        size="lg"
                        variant="profile"
                        className="w-20 h-20 text-xl"
                    />
                    <div className="text-center">
                        <p className="text-display text-2xl text-prowess-beige italic">{user.email?.split('@')[0]}</p>
                        <p className="text-label text-xs text-prowess-grey mt-1 tracking-widest">{user.email}</p>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="mb-10">
                    <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest border-b border-prowess-grey/20 pb-2">PERSONAL ANALYTICS</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-900/50 border border-white/5 p-4 flex flex-col">
                            <span className="text-display text-3xl text-prowess-beige mb-1">{stats.groupsLength}</span>
                            <span className="text-label text-[10px] text-prowess-grey uppercase tracking-widest">Active Groups</span>
                        </div>
                        <div className="bg-stone-900/50 border border-white/5 p-4 flex flex-col justify-between">
                            <div className="flex flex-col gap-1">
                                {Object.entries(stats.totalSpentByCurrency).length > 0 ? (
                                    Object.entries(stats.totalSpentByCurrency).map(([curr, amount]) => (
                                        <span key={curr} className="text-display text-2xl text-prowess-beige">
                                            {curr} {amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-display text-2xl text-prowess-beige">-</span>
                                )}
                            </div>
                            <span className="text-label text-[10px] text-prowess-grey uppercase tracking-widest mt-2">Total Paid</span>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="mb-10">
                    <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest border-b border-prowess-grey/20 pb-2">SECURITY</p>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="NEW PASSWORD"
                                className="w-full bg-transparent border-b border-prowess-grey/20 py-3 text-prowess-beige text-lg placeholder-prowess-grey/30 focus:outline-none focus:border-prowess-red transition-colors font-sans"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-3 text-prowess-grey hover:text-prowess-beige"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRM PASSWORD"
                            className="w-full bg-transparent border-b border-prowess-grey/20 py-3 text-prowess-beige text-lg placeholder-prowess-grey/30 focus:outline-none focus:border-prowess-red transition-colors font-sans"
                        />

                        {message && (
                            <div className={`text-xs uppercase tracking-widest py-2 ${message.type === 'error' ? 'text-prowess-red' : 'text-green-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            onClick={handleUpdatePassword}
                            disabled={loading || !newPassword}
                            className="w-full py-4 bg-stone-900 text-white text-label text-xs font-bold tracking-widest uppercase hover:bg-stone-800 transition-colors disabled:opacity-50 mt-4 border border-white/10"
                        >
                            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div>
                    <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest border-b border-prowess-grey/20 pb-2">ACTIONS</p>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to log out?')) {
                                signOut();
                                onClose();
                            }
                        }}
                        className="w-full py-4 border border-prowess-red text-prowess-red bg-transparent text-label text-xs font-bold uppercase tracking-widest hover:bg-prowess-red hover:text-white transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountView;
