import { useAuth } from '../../context/AuthContext';
import Avatar from '../Avatar';

interface AccountViewProps {
    onClose: () => void;
}

const AccountView: React.FC<AccountViewProps> = ({ onClose }) => {
    const { user, signOut } = useAuth();

    if (!user) return null;

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <h2 className="text-display text-xl text-prowess-beige italic">Account</h2>
                <button
                    onClick={onClose}
                    className="text-label text-xs text-prowess-grey hover:text-white uppercase tracking-widest"
                >
                    Close
                </button>
            </div>

            <div className="p-6 flex-1">
                <div className="flex flex-col items-center py-8 space-y-4">
                    <Avatar name={user.email || 'U'} size="lg" variant="filled" />
                    <div className="text-center">
                        <p className="text-display text-xl text-prowess-beige">{user.email}</p>
                        <p className="text-label text-xs text-prowess-grey mt-1">LOGGED IN VIA MAGIC LINK</p>
                    </div>
                </div>


            </div>

            <div className="p-6">
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to log out?')) {
                            signOut();
                            // Creating a small delay to allow UI to fade out if needed, though simple unmount works too
                            onClose();
                        }
                    }}
                    className="w-full py-4 border border-prowess-red text-prowess-red rounded-none text-label text-sm uppercase tracking-widest hover:bg-prowess-red hover:text-white transition-all"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AccountView;
