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
import AddExpenseSheet from './AddExpenseSheet';

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
 * Layout matches the mockup with stacked avatars and tree-branch visualization.
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
      {/* Fixed Header */}
      <Header onBack={onBack} backLabel="GROUPS" />

      {/* Scrollable Content Area - Everything scrolls together */}
      <div className="flex-1 overflow-y-auto">
        {/* Group Info - Label + Name on left, stacked avatars on right */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label text-xs text-prowess-grey mb-1">TOTAL EXPENSE</p>
              <h1 className="text-display text-xl text-prowess-beige italic">{group.name}</h1>
            </div>
            {/* Stacked avatars - using Avatar component for consistency */}
            <div className="flex items-center">
              {group.members.slice(0, 3).map((member, idx) => (
                <div 
                  key={member.id}
                  className={idx > 0 ? '-ml-3' : ''}
                  style={{ zIndex: 10 - idx }}
                >
                  <Avatar 
                    name={member.name} 
                    size="sm" 
                    variant="outline"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Expense Visualization - Tree branch style */}
        <TotalExpense
          members={group.members}
          expenses={group.expenses}
          currency={currency}
        />

        {/* Swipeable Tabs - Now part of scroll container */}
        <SwipeCarousel tabs={tabs} className="pt-4" />
      </div>

      {/* Expense Detail Sheet */}
      <ExpenseSheet
        expense={selectedExpense}
        members={group.members}
        currency={currency}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Add Expense Sheet */}
      {showAddExpense && (
        <AddExpenseSheet
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

