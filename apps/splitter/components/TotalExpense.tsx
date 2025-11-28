import { useMemo } from 'react';
import { Member, Expense } from '../../../types';
import Avatar from './Avatar';

interface TotalExpenseProps {
  members: Member[];
  expenses: Expense[];
  currency: string;
}

interface ContributionData {
  memberId: string;
  member: Member;
  amount: number;
  percentage: number;
}

/**
 * Displays the total expense with animated contribution bars.
 * Shows avatars positioned above their respective bar segments.
 */
const TotalExpense: React.FC<TotalExpenseProps> = ({ members, expenses }) => {
  const total = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const contributions = useMemo((): ContributionData[] => {
    const memberContributions: Record<string, number> = {};
    
    // Initialize all members with 0
    members.forEach(m => {
      memberContributions[m.id] = 0;
    });

    // Sum up contributions by payer
    expenses.forEach(exp => {
      if (memberContributions[exp.paidBy] !== undefined) {
        memberContributions[exp.paidBy] += exp.amount;
      }
    });

    // Convert to array with percentages
    return members.map(member => ({
      memberId: member.id,
      member,
      amount: memberContributions[member.id],
      percentage: total > 0 ? (memberContributions[member.id] / total) * 100 : 0,
    })).filter(c => c.amount > 0); // Only show members who have paid something
  }, [members, expenses, total]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Generate colors for each member
  const colors = ['bg-prowess-beige', 'bg-prowess-grey', 'bg-prowess-red/70', 'bg-stone-600', 'bg-amber-700'];

  return (
    <div className="py-8">
      {/* Total Amount */}
      <div className="text-center mb-8">
        <div 
          className="text-display text-6xl sm:text-7xl lg:text-8xl text-prowess-red italic"
          style={{ animation: 'number-pop 0.5s ease-out forwards' }}
        >
          {formatNumber(total)}
        </div>
      </div>

      {/* Contribution Bar with Avatars */}
      {contributions.length > 0 && (
        <div className="px-4">
          {/* Avatars Row */}
          <div className="flex mb-2" style={{ gap: '2px' }}>
            {contributions.map((contrib) => (
              <div
                key={contrib.memberId}
                className="flex justify-center transition-all duration-700 ease-out"
                style={{ flexGrow: contrib.percentage, flexBasis: 0 }}
              >
                <Avatar 
                  name={contrib.member.name} 
                  size="sm" 
                  variant="outline"
                />
              </div>
            ))}
          </div>

          {/* Bar */}
          <div className="contribution-bar h-2">
            {contributions.map((contrib, idx) => (
              <div
                key={contrib.memberId}
                className={`contribution-segment ${colors[idx % colors.length]}`}
                style={{ 
                  flexGrow: contrib.percentage,
                  flexBasis: 0,
                  transitionDelay: `${idx * 100}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contributions.length === 0 && (
        <div className="text-center text-prowess-grey text-sm">
          No expenses recorded yet
        </div>
      )}
    </div>
  );
};

export default TotalExpense;

