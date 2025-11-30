import { useMemo } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled';
  className?: string;
}

const sizeMap = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

/**
 * Extract initials from a name.
 * - If name has multiple words, take first letter of first two words
 * - If single word, take first two letters
 */
export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  variant = 'outline',
  className = '',
}) => {
  const initials = useMemo(() => getInitials(name), [name]);

  const baseClasses = `
    rounded-full flex items-center justify-center
    font-optician uppercase tracking-wider
    transition-colors duration-200
    ${sizeMap[size]}
  `;

  const variantClasses =
    variant === 'outline'
      ? 'border border-prowess-beige text-prowess-beige bg-transparent'
      : 'bg-prowess-beige text-black';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;

