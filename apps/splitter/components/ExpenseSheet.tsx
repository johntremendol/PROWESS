import { useState, useEffect } from 'react';
import { Member, Expense } from '../../../types';
import Avatar from './Avatar';

interface ExpenseSheetProps {
  expense: Expense | null;
  members: Member[];
  currency: string;
  onClose: () => void;
}

/**
 * Bottom slide-over sheet showing expense details.
 * Closes on backdrop tap or swipe down.
 */
const ExpenseSheet: React.FC<ExpenseSheetProps> = ({
  expense,
  members,
  currency,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Prevent body scroll when sheet is open
    if (expense) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expense]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!expense) return null;

  const payer = members.find(m => m.id === expense.paidBy);
  const splitAmount = members.length > 0 ? expense.amount / members.length : 0;

  const formatMoney = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sheet-overlay ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Sheet Content */}
      <div className={`sheet-content ${isClosing ? 'closing' : ''}`}>
        {/* Handle */}
        <div className="sheet-handle" />

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-label text-xs text-prowess-grey mb-2">
              {expense.category || 'General'}
            </p>
            <h2 className="text-display text-2xl text-prowess-beige">
              {expense.description}
            </h2>
          </div>

          {/* Amount */}
          <div className="text-center mb-8">
            <p className="text-display text-5xl text-prowess-red italic">
              {formatMoney(expense.amount)}
            </p>
          </div>

          {/* Paid By */}
          <div className="flex items-center justify-between py-4 border-b border-prowess-grey/10">
            <span className="text-prowess-grey text-sm">Paid by</span>
            <div className="flex items-center gap-2">
              {payer && <Avatar name={payer.name} size="sm" />}
              <span className="text-prowess-beige">{payer?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between py-4 border-b border-prowess-grey/10">
            <span className="text-prowess-grey text-sm">Date</span>
            <span className="text-prowess-beige text-sm">{formatDate(expense.date)}</span>
          </div>

          {/* Split Breakdown */}
          <div className="mt-6">
            <p className="text-label text-xs text-prowess-grey mb-4">Split Equally</p>
            <div className="space-y-3">
              {members.map(member => {
                const isPayer = member.id === expense.paidBy;
                const owes = isPayer ? splitAmount - expense.amount : splitAmount;

                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" variant={isPayer ? 'filled' : 'outline'} />
                      <span className="text-prowess-beige">{member.name}</span>
                    </div>
                    <span className={owes < 0 ? 'text-green-500' : 'text-prowess-grey'}>
                      {owes < 0 ? `gets ${formatMoney(Math.abs(owes))}` : formatMoney(splitAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseSheet;

