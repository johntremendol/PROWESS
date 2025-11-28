import { useState } from 'react';
import { Group, Expense, Debt } from '../../../types';
import Header from './Header';
import Avatar from './Avatar';
import TotalExpense from './TotalExpense';
import SwipeCarousel from './SwipeCarousel';
import SettlementsTab from './SettlementsTab';
import ExpensesTab from './ExpensesTab';
import AnalyticsTab from './AnalyticsTab';
import ExpenseSheet from './ExpenseSheet';
import AddExpenseModal from './AddExpenseModal';

interface GroupDetailProps {
  group: Group;
  debts: Debt[];
  currency: string;
  onBack: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

/**
 * Main group detail view with total expense visualization
 * and swipeable tabs for settlements, expenses, and analytics.
 */
const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  debts,
  currency,
  onBack,
  onAddExpense,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const tabs = [
    {
      id: 'settlements',
      label: 'SETTLEMENTS',
      content: (
        <SettlementsTab
          debts={debts}
          members={group.members}
          currency={currency}
        />
      ),
    },
    {
      id: 'expenses',
      label: 'EXPENSES',
      content: (
        <ExpensesTab
          expenses={group.expenses}
          members={group.members}
          currency={currency}
          onAddExpense={() => setShowAddExpense(true)}
          onExpenseClick={(expense) => setSelectedExpense(expense)}
        />
      ),
    },
    {
      id: 'analytics',
      label: 'ANALYTICS',
      content: (
        <AnalyticsTab
          expenses={group.expenses}
          members={group.members}
          currency={currency}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <Header onBack={onBack} />

      {/* Group Info */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label text-xs text-prowess-grey mb-1">Total Expense</p>
            <h1 className="text-display text-xl text-prowess-beige">{group.name}</h1>
          </div>
          <div className="flex -space-x-2">
            {group.members.slice(0, 5).map((member) => (
              <Avatar key={member.id} name={member.name} size="md" variant="outline" />
            ))}
            {group.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-prowess-grey/20 flex items-center justify-center text-xs text-prowess-grey">
                +{group.members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Expense Visualization */}
      <TotalExpense
        members={group.members}
        expenses={group.expenses}
        currency={currency}
      />

      {/* Swipeable Tabs */}
      <SwipeCarousel tabs={tabs} className="flex-1 border-t border-prowess-grey/10 pt-4" />

      {/* Expense Detail Sheet */}
      <ExpenseSheet
        expense={selectedExpense}
        members={group.members}
        currency={currency}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          members={group.members}
          currency={currency}
          onAdd={(expense) => {
            onAddExpense(expense);
            setShowAddExpense(false);
          }}
          onClose={() => setShowAddExpense(false)}
        />
      )}
    </div>
  );
};

export default GroupDetail;

