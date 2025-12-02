import { useMemo } from 'react';
import { Member, Expense } from '../../../types';
import Avatar from './Avatar';

interface ContributionData {
  memberId: string;
  member: Member;
  amount: number;
  percentage: number;
}

interface ContributionBarProps {
  members: Member[];
  expenses: Expense[];
  className?: string;
}

// Minimum width percentage for avatar visibility (ensures avatar doesn't get cut off)
const MIN_WIDTH_PERCENT = 15;

/**
 * ContributionBar Component
 * 
 * Visual breakdown of expense contributions per member.
 * Design: Two stacked rectangles per member
 * - Top rectangle: left, right, bottom border (U-shape, open top)
 * - Bottom rectangle: vertical tick line (1px wide)
 * - Avatar below the tick
 * 
 * Width of each segment is proportional to contribution percentage.
 * Members with 0 contribution are hidden.
 * Small contributions have a minimum width to prevent avatar cutoff.
 */
const ContributionBar: React.FC<ContributionBarProps> = ({
  members,
  expenses,
  className = '',
}) => {
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
      // Handle both string (single payer) and PayerContribution[] (multi-payer)
      if (typeof exp.paidBy === 'string') {
        if (memberContributions[exp.paidBy] !== undefined) {
          memberContributions[exp.paidBy] += exp.amount;
        }
      } else if (Array.isArray(exp.paidBy)) {
        exp.paidBy.forEach(contrib => {
          if (memberContributions[contrib.memberId] !== undefined) {
            memberContributions[contrib.memberId] += contrib.amount;
          }
        });
      }
    });

    // Calculate percentages, filter out zero contributions
    const rawData = members
      .map(member => ({
        memberId: member.id,
        member,
        amount: memberContributions[member.id],
        percentage: total > 0 ? (memberContributions[member.id] / total) * 100 : 0,
      }))
      .filter(c => c.amount > 0);

    // If no contributions, show all members equally
    if (rawData.length === 0 && members.length > 0) {
      return members.map(member => ({
        memberId: member.id,
        member,
        amount: 0,
        percentage: 100 / members.length,
      }));
    }

    // Apply minimum width tolerance
    const needsMinWidth = rawData.filter(c => c.percentage < MIN_WIDTH_PERCENT);
    const normalSegments = rawData.filter(c => c.percentage >= MIN_WIDTH_PERCENT);

    if (needsMinWidth.length > 0) {
      const extraNeeded = needsMinWidth.reduce((sum, c) => sum + (MIN_WIDTH_PERCENT - c.percentage), 0);
      const normalTotal = normalSegments.reduce((sum, c) => sum + c.percentage, 0);
      const scaleFactor = normalTotal > 0 ? (normalTotal - extraNeeded) / normalTotal : 1;

      return rawData.map(c => ({
        ...c,
        percentage: c.percentage < MIN_WIDTH_PERCENT
          ? MIN_WIDTH_PERCENT
          : c.percentage * scaleFactor,
      }));
    }

    return rawData;
  }, [members, expenses, total]);

  if (contributions.length === 0) {
    return null;
  }

  // Gap between segments in pixels
  const GAP_PX = 12;

  return (
    <div className={`w-full ${className}`}>
      {/* Contribution Segments Row - with gap between segments */}
      <div className="flex w-full" style={{ gap: `${GAP_PX}px` }}>
        {contributions.map((contrib) => (
          <div
            key={contrib.memberId}
            className="flex flex-col items-center"
            style={{
              // Subtract gap from percentage calculation
              width: `calc(${contrib.percentage}% - ${(GAP_PX * (contributions.length - 1)) / contributions.length}px)`,
              flexShrink: 0,
            }}
          >
            {/* Top Rectangle: U-shape (left, bottom, right borders) */}
            <div className="w-full h-4 border-l border-r border-b border-[#CC342C]" />

            {/* Bottom Rectangle: Vertical tick (1px wide line) */}
            <div className="w-px h-5 bg-[#CC342C]" />

            {/* Avatar - Using the Avatar component for consistency */}
            <div className="mt-3">
              <Avatar
                name={contrib.member.name}
                size="md"
                variant="outline"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionBar;

