import { Expense, Member } from '../../../types';
import Avatar from './Avatar';

interface ExpenseItemProps {
  expense: Expense;
  payer?: Member;
  currency: string;
  onClick: () => void;
}

/**
 * ExpenseItem Component
 * 
 * Displays a single expense in the list.
 * Layout:
 * - Top row: Date (left) and Time (right)
 * - Bottom row: Avatar, Description/Category, Amount
 */
const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  payer,
  currency,
  onClick,
}) => {
  const dateObj = new Date(expense.date);

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    // Check if it's a valid date
    if (isNaN(date.getTime())) return expense.date;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const formatTime = (date: Date): string => {
    if (isNaN(date.getTime()) || expense.date.length <= 10) return ''; // No time available for YYYY-MM-DD
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatMoney = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div
      onClick={onClick}
      className="py-6 border-b border-black cursor-pointer hover:brightness-110 transition-all"
      style={{ backgroundColor: '#1F1A17' }}
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
              className="text-label text-xs text-prowess-grey capitalize font-serif"
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
  );
};

export default ExpenseItem;

