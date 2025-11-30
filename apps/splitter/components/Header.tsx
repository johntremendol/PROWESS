import splitterLogo from '../../../src/assets/splitterlogo.png';

interface HeaderProps {
  onBack?: () => void;
  className?: string;
}

/**
 * Splitter app header with the app logo centered at top.
 * Optionally shows a back button.
 */
const Header: React.FC<HeaderProps> = ({ onBack, className = '' }) => {
  return (
    <header className={`w-full flex justify-center items-center py-4 relative ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-4 text-prowess-grey hover:text-prowess-beige transition-colors text-nav"
        >
          ← Back
        </button>
      )}
      <img src={splitterLogo} alt="Splitter" className="w-10 h-10 object-contain" />
    </header>
  );
};

export default Header;

