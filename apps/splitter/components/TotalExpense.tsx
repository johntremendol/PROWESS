import { useRef, useEffect, useState, useMemo } from 'react';
import { Member, Expense } from '../../../types';
import ContributionBar from './ContributionBar';

interface TotalExpenseProps {
  members: Member[];
  expenses: Expense[];
  currency: string;
}

/**
 * Displays the total expense with contribution breakdown visualization.
 * 
 * TEXT SCALING STRATEGY:
 * - Text should fill the same width as the ContributionBar (px-4 on both sides)
 * - Use CSS width: 100% on the text and let it scale via a calculated font-size
 * - Measure once, calculate the exact font size needed, apply it
 */
const TotalExpense: React.FC<TotalExpenseProps> = ({ members, expenses, currency }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  const total = useMemo(() => {
    return expenses
      .filter(exp => exp.category !== 'settlement')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formattedTotal = `${currency}${formatNumber(total)}`;

  // Calculate the exact font size needed to fill the container
  useEffect(() => {
    const calculateFontSize = () => {
      if (!containerRef.current || !measureRef.current) return;

      // Reset to measure at a known size
      measureRef.current.style.fontSize = '100px';

      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = measureRef.current.offsetWidth;

      if (textWidth > 0 && containerWidth > 0) {
        // Calculate the exact font size to fill the container
        // Reduce by 5% to account for font overhang (serif fonts have visual overflow)
        const exactSize = ((containerWidth * 0.95) / textWidth) * 100;
        // Clamp to reasonable bounds
        const clampedSize = Math.max(40, Math.min(180, exactSize));
        setFontSize(clampedSize);
      }
    };

    // Run calculation after render
    const timer = requestAnimationFrame(calculateFontSize);

    // Also recalculate on resize
    window.addEventListener('resize', calculateFontSize);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('resize', calculateFontSize);
    };
  }, [formattedTotal]);

  const hasContributions = expenses.length > 0;

  return (
    <div className="py-4">
      {/* Total Amount - Fills the same width as ContributionBar */}
      <div
        ref={containerRef}
        className="px-4 mb-2 overflow-hidden"
      >
        {/* Hidden measurement span */}
        <span
          ref={measureRef}
          className="text-display text-prowess-beige whitespace-nowrap absolute opacity-0 pointer-events-none"
          style={{ fontSize: '100px' }}
          aria-hidden="true"
        >
          {formattedTotal}
        </span>

        {/* Visible text with calculated font size */}
        <span
          className="text-display text-prowess-beige whitespace-nowrap block text-center"
          style={{
            fontSize: fontSize ? `${fontSize}px` : '100px',
            lineHeight: 1.1,
            opacity: fontSize ? 1 : 0, // Hide until calculated
            transition: 'opacity 0.1s',
          }}
        >
          {formattedTotal}
        </span>
      </div>

      {/* Contribution Breakdown */}
      {hasContributions ? (
        <ContributionBar
          members={members}
          expenses={expenses}
          className="px-4"
        />
      ) : (
        <div className="text-center text-prowess-grey text-sm py-8">
          No expenses recorded yet
        </div>
      )}
    </div>
  );
};

export default TotalExpense;
