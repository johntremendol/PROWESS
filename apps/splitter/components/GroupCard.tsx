import { useState, useRef } from 'react';
import { Member } from '../../../types';
import Avatar from './Avatar';

interface GroupCardProps {
  name: string;
  members: Member[];
  expenseCount?: number;
  onClick: () => void;
  onDelete?: () => void;
}

/**
 * Group card component for the groups list.
 * Full-width dark card with group name and member avatars.
 * Supports swipe-to-delete on mobile only.
 */
const GroupCard: React.FC<GroupCardProps> = ({
  name,
  members,
  onClick,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const DELETE_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;
    
    // Only allow left swipe (positive diff)
    if (diff > 10) {
      isDraggingRef.current = true;
      const offset = Math.min(diff, DELETE_THRESHOLD + 20);
      setSwipeOffset(offset);
    } else if (diff < -10 && swipeOffset > 0) {
      // Allow swipe back right
      isDraggingRef.current = true;
      setSwipeOffset(Math.max(0, swipeOffset + diff));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > DELETE_THRESHOLD / 2) {
      setSwipeOffset(DELETE_THRESHOLD);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleClick = () => {
    if (!isDraggingRef.current && swipeOffset === 0) {
      onClick();
    } else if (swipeOffset > 0) {
      setSwipeOffset(0);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
      if (confirmed) {
        setIsDeleting(true);
        onDelete();
      }
    }
  };

  return (
    <div ref={cardRef} className="relative overflow-hidden border-t border-stone-800/50">
      {/* Delete Button - Behind the card (for swipe on mobile) - Hidden from accessibility when not visible */}
      {swipeOffset > 0 && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-prowess-red"
          style={{ width: DELETE_THRESHOLD }}
        >
          <button
            onClick={handleDelete}
            className="text-label text-prowess-beige text-sm px-4 py-2"
          >
            Delete
          </button>
        </div>
      )}

      {/* Card Content - Slides left on swipe */}
      <button
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={`relative w-full bg-stone-900 px-5 py-6 text-left transition-transform duration-200 ease-out cursor-pointer ${
          isDeleting ? 'opacity-50' : ''
        }`}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
      >
        <h3 className="text-display text-2xl text-prowess-beige italic mb-3">{name}</h3>
        <div className="flex items-center gap-2">
          {members.slice(0, 4).map((member) => (
            <Avatar key={member.id} name={member.name} size="sm" />
          ))}
          {members.length > 4 && (
            <span className="text-label text-xs text-prowess-grey ml-1">+{members.length - 4}</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default GroupCard;

