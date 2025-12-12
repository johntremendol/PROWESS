import { useState, useRef } from 'react';
import { Expense, Member } from '../../../types';
import Avatar from './Avatar';
import { Trash2 } from '../../../components/ui/Icons'; // Assuming you have this icon

interface ExpenseItemProps {
  expense: Expense;
  payer?: Member;
  currency: string;
  onClick: () => void;
  onDelete?: () => void;
}

/**
 * ExpenseItem Component
 * 
 * Displays a single expense in the list.
 * Supports swipe-to-delete (Left Swipe).
 */
const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  payer,
  currency,
  onClick,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const DELETE_THRESHOLD = 80;

  const dateObj = new Date(expense.date);

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    if (isNaN(date.getTime())) return expense.date;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const formatTime = (date: Date): string => {
    if (isNaN(date.getTime()) || expense.date.length <= 10) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatMoney = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Stop propagation so the parent carousel doesn't swipe when we start touching an item
    // This effectively disables tab swiping on expense items, ensuring delete gesture works reliably
    e.stopPropagation();

    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;

    // Only allow left swipe (positive diff)
    if (diff > 5) {
      isDraggingRef.current = true;
      const offset = Math.min(diff, DELETE_THRESHOLD + 20); // Rubber band effect
      setSwipeOffset(offset);
    } else if (diff < -5 && swipeOffset > 0) {
      // Allow swipe back right to close
      isDraggingRef.current = true;
      setSwipeOffset(Math.max(0, swipeOffset + diff));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (swipeOffset > DELETE_THRESHOLD / 2) {
      setSwipeOffset(DELETE_THRESHOLD);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDraggingRef.current && swipeOffset === 0) {
      onClick();
    } else if (swipeOffset > 0) {
      setSwipeOffset(0);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      // Optimistic UI update or confirmation could happen here
      // Usually better to confirm
      const confirmed = window.confirm(`Delete expense "${expense.description}"?`);
      if (confirmed) {
        setIsDeleting(true);
        onDelete();
        // Reset offset immediately or let parent remove component
        setSwipeOffset(0);
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#1F1A17] border-b border-black">
      {/* Delete Button Layer */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-prowess-red z-0"
        style={{ width: DELETE_THRESHOLD }}
      >
        <button
          onClick={handleDelete}
          className="w-full h-full flex items-center justify-center text-prowess-beige"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Swipeable Content Layer */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={`relative z-10 py-6 pr-4 bg-[#1F1A17] cursor-pointer transition-transform duration-200 ease-out flex flex-col ${isDeleting ? 'opacity-0' : ''}`}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          backgroundColor: '#1F1A17' // Ensure bg is opaque to hide red button
        }}
      >
        {/* Header: Date and Time */}
        <div className="flex justify-between items-center mb-3 px-4">
          <span className="text-label text-xs text-prowess-grey tracking-widest">
            {formatDate(dateObj)}
          </span>
          <span className="text-label text-xs text-prowess-grey tracking-widest">
            {formatTime(dateObj)}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {payer && (
              <Avatar
                name={payer.name}
                size="md"
                variant="outline"
              />
            )}

            <div className="flex flex-col">
              <span className="text-display text-xl text-prowess-beige italic leading-tight mb-1">
                {expense.description}
              </span>
              <span
                className="text-label text-xs text-prowess-grey capitalize font-serif tracking-[0]"
                style={{ fontFamily: 'Palatino, serif' }}
              >
                {expense.category || 'General'}
              </span>
            </div>
          </div>

          <div className="text-display text-3xl text-prowess-beige italic">
            {formatMoney(expense.amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
