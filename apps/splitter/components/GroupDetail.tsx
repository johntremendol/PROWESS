import { useState, useMemo } from 'react';
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
import AddSettlementSheet from './AddSettlementSheet';
import EditGroupSheet from './EditGroupSheet'; // Import

const DEFAULT_CATEGORIES = ['food', 'travel', 'stay', 'miscellaneous'];

interface Settlement {
  id: string;
  paidBy: string;
  paidTo: string;
  amount: number;
  date: string;
}

interface GroupDetailProps {
  group: Group;
  debts: Debt[];
  currency: string;
  onBack: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense?: (expense: Expense) => void;
  onUpdateGroup?: (name: string, members: { id: string | null; name: string; email?: string }[], currency: string) => void;
  onAddSettlement?: (settlement: Omit<Settlement, 'id'>) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onCustomCategoryAdd?: (category: string) => void;
  currentUserName?: string;
  onProfileClick?: () => void;
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
  onUpdateExpense,
  onUpdateGroup,
  onAddSettlement,
  onDeleteExpense,
  onCustomCategoryAdd,
  currentUserName,
  onProfileClick,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSettlement, setShowAddSettlement] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const settlements: Settlement[] = useMemo(() => {
    return group.expenses
      .filter(e => e.category === 'settlement')
      .map(e => ({
        id: e.id,
        amount: e.amount,
        paidBy: typeof e.paidBy === 'string' ? e.paidBy : e.paidBy[0].memberId,
        paidTo: e.splitBetween?.[0] || '',
        date: e.date
      }));
  }, [group.expenses]);

  // Extract unique custom categories from existing expenses (excluding defaults)
  const customCategories = useMemo(() => {
    const allCategories = group.expenses
      .map(e => e.category?.toLowerCase())
      .filter((cat): cat is string => !!cat);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories.filter(cat => !DEFAULT_CATEGORIES.includes(cat));
  }, [group.expenses]);

  const handleAddSettlement = (settlement: Omit<Settlement, 'id'>) => {
    onAddSettlement?.(settlement);
  };

  const handleUpdateSettlement = (updated: { id?: string; paidBy: string; paidTo: string; amount: number; date: string }) => {
    if (!updated.id || !onUpdateExpense) return;

    // Convert settlement update back to expense structure
    const expense: Expense = {
      id: updated.id,
      description: 'Settlement',
      amount: updated.amount,
      paidBy: updated.paidBy,
      splitBetween: [updated.paidTo],
      category: 'settlement',
      date: updated.date
    };

    onUpdateExpense(expense);
    setSelectedSettlement(null);
  };

  const handleDeleteSettlement = () => {
    if (selectedSettlement && onDeleteExpense) {
      onDeleteExpense(selectedSettlement.id);
      setSelectedSettlement(null);
    }
  };

  const tabs = [
    {
      id: 'settlements',
      label: 'SETTLEMENTS',
      content: (
        <SettlementsTab
          debts={debts}
          members={group.members}
          currency={currency}
          settlements={settlements}
          onNewSettlement={() => setShowAddSettlement(true)}
          onSettlementClick={setSelectedSettlement}
        />
      ),
    },
    {
      id: 'expenses',
      label: 'EXPENSES',
      content: (
        <ExpensesTab
          expenses={group.expenses.filter(e => e.category !== 'settlement')}
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
      <Header
        onBack={onBack}
        backLabel="GROUPS"
        userName={currentUserName}
        onProfileClick={onProfileClick}
      />

      {/* Scrollable Content Area - Everything scrolls together */}
      <div className={`flex-1 ${showAddExpense || showAddSettlement || showEditGroup || selectedExpense || selectedSettlement ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Group Info - Label + Name on left, stacked avatars on right */}
        {/* Made clickable to trigger Edit Group */}
        <div
          className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors rounded-lg mx-2 mt-2"
          onClick={() => setShowEditGroup(true)}
        >
          <div className="flex items-start justify-between pointer-events-none"> {/* content ignores clicks so wrapper handles it */}
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
        customCategories={customCategories}
        onUpdate={(updated) => {
          onUpdateExpense?.(updated);
          setSelectedExpense(null);
        }}
        onCustomCategoryAdd={onCustomCategoryAdd}
        onDelete={() => {
          if (selectedExpense) {
            onDeleteExpense?.(selectedExpense.id);
            setSelectedExpense(null);
          }
        }}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Add Expense Sheet */}
      {showAddExpense && (
        <AddExpenseSheet
          members={group.members}
          currency={currency}
          customCategories={customCategories}
          onAdd={(expense) => {
            onAddExpense(expense);
            setShowAddExpense(false);
          }}
          onCustomCategoryAdd={onCustomCategoryAdd}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* Add Settlement Sheet (Create Mode) */}
      {showAddSettlement && (
        <AddSettlementSheet
          members={group.members}
          currency={currency}
          onAdd={(settlement) => {
            handleAddSettlement(settlement);
            setShowAddSettlement(false);
          }}
          onClose={() => setShowAddSettlement(false)}
        />
      )}

      {/* Edit Settlement Sheet (Edit/Delete Mode) */}
      {selectedSettlement && (
        <AddSettlementSheet
          members={group.members}
          currency={currency}
          initialSettlement={selectedSettlement}
          onUpdate={handleUpdateSettlement}
          onDelete={handleDeleteSettlement}
          onClose={() => setSelectedSettlement(null)}
        />
      )}

      {/* Edit Group Sheet */}
      {showEditGroup && onUpdateGroup && (
        <EditGroupSheet
          group={group}
          onUpdateGroup={onUpdateGroup}
          onClose={() => setShowEditGroup(false)}
        />
      )}
    </div>
  );
};

export default GroupDetail;
