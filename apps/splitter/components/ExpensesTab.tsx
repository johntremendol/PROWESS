import { Member, Expense } from '../../../types';
import { Plus } from '../../../components/ui/Icons';
import Avatar from './Avatar';

interface ExpensesTabProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
  onAddExpense: () => void;
  onExpenseClick: (expense: Expense) => void;
}

/**
 * Expenses tab showing list of all expenses.
 * Includes create new button at top and clickable expense rows.
 */
const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  members,
  currency,
  onAddExpense,
  onExpenseClick,
}) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const formatMoney = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    if (diffDays < 7) return `${diffDays} DAYS AGO`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  return (
    <div className="px-4">
      {/* Create New Button */}
      <button
        onClick={onAddExpense}
        className="btn-create w-full mb-4"
      >
        <div className="w-8 h-8 rounded-full border border-prowess-beige/30 flex items-center justify-center">
          <Plus size={16} className="text-prowess-beige/60" />
        </div>
        <span className="flex-1 text-left text-prowess-beige/60">create new</span>
        <span className="text-prowess-grey text-sm">{currency} Amount</span>
      </button>

      {/* Expenses List */}
      <div className="space-y-0">
        {expenses.map((expense) => {
          const payer = getMember(expense.paidBy);
          
          return (
            <div
              key={expense.id}
              onClick={() => onExpenseClick(expense)}
              className="expense-row"
            >
              {/* Left: Avatar + Description */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {payer && (
                  <Avatar name={payer.name} size="sm" variant="filled" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-prowess-beige truncate">{expense.description}</p>
                </div>
              </div>

              {/* Right: Amount + Date */}
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-prowess-beige">{formatMoney(expense.amount)}</p>
                <p className="text-prowess-grey text-xs text-label">{formatDate(expense.date)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center py-16 text-prowess-grey">
          <p className="text-sm text-label">No Expenses Yet</p>
          <p className="text-xs mt-2">Tap "create new" to add one</p>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;

