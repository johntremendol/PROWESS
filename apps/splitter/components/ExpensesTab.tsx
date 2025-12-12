import { Member, Expense } from '../../../types';
import { Plus } from '../../../components/ui/Icons';
import ExpenseItem from './ExpenseItem';

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

  return (
    <div className="flex flex-col">
      {/* Add Expense Button - Full Width Red Bar */}
      <button
        onClick={onAddExpense}
        className="w-full bg-prowess-red py-6 px-4 flex items-center gap-3 hover:brightness-110 transition-all"
      >
        <div className="w-10 h-10 rounded-full border border-prowess-beige/50 flex items-center justify-center">
          <Plus size={20} className="text-prowess-beige" />
        </div>
        <span className="text-display text-2xl text-prowess-beige italic">New Expense</span>
      </button>

      {/* Expenses List */}
      <div className="flex flex-col">
        {expenses.map((expense) => {
          // Get payer ID - handle both string and array formats
          const payerId = typeof expense.paidBy === 'string'
            ? expense.paidBy
            : expense.paidBy[0]?.memberId;

          return (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              payer={getMember(payerId)}
              currency={currency}
              onClick={() => onExpenseClick(expense)}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center py-16 text-prowess-grey">
          <p className="text-sm text-label">No Expenses Yet</p>
          <p className="text-xs mt-2">Tap "New Expense" to start</p>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;

