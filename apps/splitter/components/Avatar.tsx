import { useMemo } from 'react';
import { Member } from '../../../types';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled';
  className?: string;
}

interface AvatarStackProps {
  members: Member[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

// Overlap amount for stacked avatars (negative margin)
const overlapMap = {
  xs: '-ml-2',
  sm: '-ml-3',
  md: '-ml-3',
  lg: '-ml-4',
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
  // If one word, take first two letters. If only 1 letter total, take that.
  return name.slice(0, 2).toUpperCase();
};

/**
 * Avatar component displaying member initials.
 * Uses text-label class for Optician Sans font.
 * 
 * CONSISTENT STYLING:
 * - outline: Dark background (stone-900), subtle border (stone-700), grey text
 * - filled: Beige background, dark text (for contrast on red backgrounds)
 */
const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  variant = 'outline',
  className = '',
}) => {
  const initials = useMemo(() => getInitials(name), [name]);

  const baseClasses = `
    rounded-full flex items-center justify-center
    text-label
    transition-colors duration-200
    ${sizeMap[size]}
  `;

  // Consistent styling across the app
  const variantClasses =
    variant === 'outline'
      ? 'bg-stone-900 border border-stone-700 text-prowess-grey'
      : 'bg-prowess-beige text-prowess-red';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

/**
 * Stacked avatar group with overlapping avatars.
 * Each avatar has a filled background so they superimpose cleanly.
 */
export const AvatarStack: React.FC<AvatarStackProps> = ({
  members,
  max = 5,
  size = 'sm',
  className = '',
}) => {
  const visibleMembers = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {visibleMembers.map((member, idx) => (
        <Avatar
          key={member.id}
          name={member.name}
          size={size}
          variant="filled"
          className={idx > 0 ? overlapMap[size] : ''}
        />
      ))}
      {overflow > 0 && (
        <div 
          className={`
            ${sizeMap[size]} rounded-full bg-stone-800 border-2 border-black
            flex items-center justify-center text-label text-prowess-grey
            ${overlapMap[size]}
          `}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default Avatar;

