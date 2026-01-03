import { Member, Debt } from '../../../types';
import { Plus } from '../../../components/ui/Icons';
import SettlementRow from './SettlementRow';

interface Settlement {
  id: string;
  paidBy: string;
  paidTo: string;
  amount: number;
  date: string;
}

interface SettlementsTabProps {
  debts: Debt[];
  members: Member[];
  currency: string;
  settlements?: Settlement[];
  onNewSettlement: () => void;
  onSettlementClick?: (settlement: Settlement) => void;
  onSettleDebt?: (debt: Debt) => void;
}

/**
 * Settlements tab showing:
 * - New Settlement button (red bar)
 * - PENDING section with calculated debts (long-press to settle)
 * - HISTORY section with recorded settlements
 */
const SettlementsTab: React.FC<SettlementsTabProps> = ({
  debts,
  members,
  currency,
  settlements = [],
  onNewSettlement,
  onSettlementClick,
  onSettleDebt,
}) => {
  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="flex flex-col">
      {/* New Settlement Button - Red Bar */}
      <button
        onClick={onNewSettlement}
        className="w-full bg-prowess-red py-6 px-4 flex items-center gap-3 hover:brightness-110 transition-all"
      >
        <div className="w-10 h-10 rounded-full border border-prowess-beige/50 flex items-center justify-center">
          <Plus size={20} className="text-prowess-beige" />
        </div>
        <span className="text-display text-2xl text-prowess-beige italic">New Settlement</span>
      </button>

      {/* PENDING Section */}
      <div className="px-4 pt-6 pb-2">
        <p className="text-label text-xs text-prowess-grey tracking-widest">PENDING</p>
      </div>

      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-label text-sm text-prowess-grey/50 tracking-widest uppercase">all settled</p>
        </div>
      ) : (
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
                isPending={true}
                onLongPress={() => onSettleDebt?.(debt)}
              />
            );
          })}
        </div>
      )}

      {/* HISTORY Section - Only show if there are settlements */}
      {settlements.length > 0 && (
        <>
          <div className="px-4 pt-8 pb-2">
            <p className="text-label text-xs text-prowess-grey tracking-widest">HISTORY</p>
          </div>
          <div className="flex flex-col opacity-70">
            {settlements.map((settlement) => {
              const from = getMember(settlement.paidBy);
              const to = getMember(settlement.paidTo);

              if (!from || !to) return null;

              return (
                <div
                  key={settlement.id}
                  className="bg-black/30 cursor-pointer hover:bg-black/50 transition-colors"
                  onClick={() => onSettlementClick?.(settlement)}
                >
                  <SettlementRow
                    from={from}
                    to={to}
                    amount={settlement.amount}
                    currency={currency}
                    isPending={false}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SettlementsTab;
