import { Member, Debt } from '../../../types';
import Avatar from './Avatar';

interface SettlementsTabProps {
  debts: Debt[];
  members: Member[];
  currency: string;
}

/**
 * Settlements tab showing who owes whom.
 * Displays avatar pairs with amounts.
 */
const SettlementsTab: React.FC<SettlementsTabProps> = ({ debts, members, currency }) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  const formatMoney = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-prowess-grey">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-sm text-label">All Settled Up</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      {debts.map((debt, idx) => {
        const from = getMember(debt.from);
        const to = getMember(debt.to);
        
        if (!from || !to) return null;

        return (
          <div
            key={idx}
            className="flex items-center justify-between py-4 border-b border-prowess-grey/10 last:border-0"
          >
            {/* From -> To */}
            <div className="flex items-center gap-3">
              <Avatar name={from.name} size="md" variant="outline" />
              <div className="flex flex-col">
                <span className="text-prowess-beige text-sm">{from.name}</span>
                <span className="text-prowess-grey text-xs">pays {to.name}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-display text-xl text-prowess-red">
              {formatMoney(debt.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettlementsTab;

