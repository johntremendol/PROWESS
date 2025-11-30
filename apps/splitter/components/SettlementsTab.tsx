import { Member, Debt } from '../../../types';
import SettlementRow from './SettlementRow';

interface SettlementsTabProps {
  debts: Debt[];
  members: Member[];
  currency: string;
}

/**
 * Settlements tab showing who owes whom.
 * Uses SettlementRow component for consistent styling.
 */
const SettlementsTab: React.FC<SettlementsTabProps> = ({ debts, members, currency }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-prowess-grey">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-sm text-label">All Settled Up</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {debts.map((debt, idx) => {
        const from = getMember(debt.from);
        const to = getMember(debt.to);
        
        if (!from || !to) return null;

        return (
          <SettlementRow
            key={idx}
            from={from}
            to={to}
            amount={debt.amount}
            currency={currency}
          />
        );
      })}
    </div>
  );
};

export default SettlementsTab;

