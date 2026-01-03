import Avatar from './Avatar';

interface HeaderProps {
  onBack?: () => void;
  backLabel?: string;
  onProfileClick?: () => void;
  userName?: string;
  className?: string;
}

/**
 * Splitter app header with the app logo centered at top.
 * Back button and logo both navigate back when clicked.
 */
const Header: React.FC<HeaderProps> = ({ onBack, backLabel = 'Back', onProfileClick, userName, className = '' }) => {
  return (
    <header className={`w-full flex justify-between items-center px-4 py-4 relative ${className}`}>
      {/* Left: Back Button */}
      <div className="w-20">
        {onBack && (
          <button
            onClick={onBack}
            className="text-prowess-grey hover:text-prowess-beige transition-colors text-nav uppercase tracking-widest flex items-center gap-1"
          >
            <span>←</span> {backLabel}
          </button>
        )}
      </div>

      {/* Center: Flex Spacer */}
      <div className="flex-1"></div>

      {/* Right: Logo / Profile Trigger */}
      <div className="w-20 flex justify-end">
        <button
          onClick={onProfileClick}
          className="hover:opacity-80 transition-opacity"
        >
          <Avatar
            name={userName || 'User'}
            size="md"
            variant="profile"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;

