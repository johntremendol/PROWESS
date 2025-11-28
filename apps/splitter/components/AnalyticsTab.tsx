import { Member, Expense } from '../../../types';

interface AnalyticsTabProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
}

/**
 * Analytics tab placeholder.
 * Will be expanded with charts and insights later.
 */
const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ expenses, members, currency }) => {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgPerPerson = members.length > 0 ? total / members.length : 0;

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-label text-xs text-prowess-grey mb-2">Analytics</h3>
        <p className="text-prowess-beige/60 text-sm">Coming Soon</p>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-6 border border-prowess-grey/10">
          <p className="text-label text-xs text-prowess-grey mb-2">Total Spent</p>
          <p className="text-display text-2xl text-prowess-red">
            {currency}{total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="text-center p-6 border border-prowess-grey/10">
          <p className="text-label text-xs text-prowess-grey mb-2">Per Person</p>
          <p className="text-display text-2xl text-prowess-beige">
            {currency}{avgPerPerson.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="text-center p-6 border border-prowess-grey/10">
          <p className="text-label text-xs text-prowess-grey mb-2">Members</p>
          <p className="text-display text-2xl text-prowess-beige">{members.length}</p>
        </div>

        <div className="text-center p-6 border border-prowess-grey/10">
          <p className="text-label text-xs text-prowess-grey mb-2">Expenses</p>
          <p className="text-display text-2xl text-prowess-beige">{expenses.length}</p>
        </div>
      </div>

      {/* Placeholder for future charts */}
      <div className="mt-12 text-center text-prowess-grey/40 text-xs">
        <p>Charts and detailed breakdowns</p>
        <p>will appear here</p>
      </div>
    </div>
  );
};

export default AnalyticsTab;

