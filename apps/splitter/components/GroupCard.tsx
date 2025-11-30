import { useState, useRef, useEffect } from 'react';
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
 * Supports swipe-to-delete on mobile, right-click context menu on desktop.
 */
const GroupCard: React.FC<GroupCardProps> = ({
  name,
  members,
  onClick,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const DELETE_THRESHOLD = 80;

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showContextMenu]);

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
    if (!isDraggingRef.current && swipeOffset === 0 && !showContextMenu) {
      onClick();
    } else if (swipeOffset > 0) {
      setSwipeOffset(0);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setContextMenuPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setShowContextMenu(true);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
      if (confirmed) {
        setIsDeleting(true);
        setShowContextMenu(false);
        onDelete();
      }
    }
  };

  return (
    <div ref={cardRef} className="relative overflow-hidden border-t border-stone-800/50">
      {/* Delete Button - Behind the card (for swipe on mobile) */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-prowess-red"
        style={{ width: DELETE_THRESHOLD }}
      >
        <button
          onClick={handleDelete}
          className="font-optician text-prowess-beige text-sm uppercase tracking-wider px-4 py-2"
        >
          Delete
        </button>
      </div>

      {/* Card Content - Slides left on swipe */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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
            <span className="font-optician text-xs text-prowess-grey ml-1">+{members.length - 4}</span>
          )}
        </div>
      </div>

      {/* Context Menu (Desktop right-click) */}
      {showContextMenu && (
        <div
          className="absolute z-50 bg-stone-900 border border-stone-700 rounded shadow-lg py-1 min-w-[120px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left font-optician text-sm text-prowess-red hover:bg-stone-800 uppercase tracking-wider"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupCard;

