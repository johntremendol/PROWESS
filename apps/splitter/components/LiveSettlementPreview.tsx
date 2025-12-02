import { Member } from '../../../types';
import Avatar from './Avatar';

interface LiveSettlementPreviewProps {
  members: Member[];
  selectedPayers: string[];
  contributions: Record<string, number>;
  totalAmount: number;
  currency: string;
}

interface Settlement {
  from: Member;
  to: Member;
  amount: number;
}

/**
 * LiveSettlementPreview Component
 * 
 * Shows real-time settlement calculations for non-payers.
 * Displays who owes whom and how much using SettlementRow styling.
 * Updates dynamically as payers and contributions change.
 */
const LiveSettlementPreview: React.FC<LiveSettlementPreviewProps> = ({
  members,
  selectedPayers,
  contributions,
  totalAmount,
  currency,
}) => {
  // Calculate settlements
  const calculateSettlements = (): Settlement[] => {
    if (selectedPayers.length === 0 || totalAmount === 0) return [];

    const nonPayers = members.filter(m => !selectedPayers.includes(m.id));
    if (nonPayers.length === 0) return [];

    const perPersonShare = totalAmount / members.length;
    const settlements: Settlement[] = [];

    // For each non-payer, calculate what they owe to each payer
    nonPayers.forEach(nonPayer => {
      selectedPayers.forEach(payerId => {
        const payer = members.find(m => m.id === payerId);
        if (!payer) return;

        const payerContribution = contributions[payerId] || 0;
        if (payerContribution === 0) return;

        // Calculate proportion of what this non-payer owes to this specific payer
        const payerProportion = payerContribution / totalAmount;
        const owedToPayer = perPersonShare * payerProportion;

        if (owedToPayer > 0) {
          settlements.push({
            from: nonPayer,
            to: payer,
            amount: owedToPayer,
          });
        }
      });
    });

    return settlements;
  };

  const settlements = calculateSettlements();

  if (settlements.length === 0) {
    return null;
  }

  const formatAmount = (amount: number): string => {
    return `${currency}${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <p className="text-label text-xs text-prowess-grey">SETTLEMENTS</p>
      
      <div className="space-y-2">
        {settlements.map((settlement, idx) => (
          <div
            key={`${settlement.from.id}-${settlement.to.id}-${idx}`}
            className="flex items-center py-4 px-4 border-b border-black"
            style={{
              backgroundColor: '#1F1A17',
              animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`,
            }}
          >
            {/* From Avatar */}
            <Avatar
              name={settlement.from.name}
              size="md"
              variant="outline"
            />

            {/* Left Line - Straight, no arrow */}
            <div className="flex-1 h-px bg-prowess-red mx-3" />

            {/* Amount in Center */}
            <div className="text-display text-xl text-prowess-beige whitespace-nowrap">
              {formatAmount(settlement.amount)}
            </div>

            {/* Right Line - With arrow pointing to recipient */}
            <div className="flex-1 h-px bg-prowess-red mx-3 relative">
              {/* Arrow Head */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
                style={{
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderLeft: '6px solid #CC342C',
                }}
              />
            </div>

            {/* To Avatar */}
            <Avatar
              name={settlement.to.name}
              size="md"
              variant="outline"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Add keyframe animation to index.css
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('[data-animation="fadeInUp"]')) {
  style.setAttribute('data-animation', 'fadeInUp');
  document.head.appendChild(style);
}

export default LiveSettlementPreview;

