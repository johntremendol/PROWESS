import splitterLogo from '../../../src/assets/splitterlogo.png';

interface HeaderProps {
  onBack?: () => void;
  backLabel?: string;
  onProfileClick?: () => void;
  className?: string;
}

/**
 * Splitter app header with the app logo centered at top.
 * Back button and logo both navigate back when clicked.
 */
const Header: React.FC<HeaderProps> = ({ onBack, backLabel = 'Back', onProfileClick, className = '' }) => {
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
          className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors"
        >
          <img src={splitterLogo} alt="Profile" className="h-6 object-contain filter brightness-100 opacity-80" />
        </button>
      </div>
    </header>
  );
};

export default Header;

