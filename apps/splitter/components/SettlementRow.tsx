import { Member } from '../../../types';
import Avatar from './Avatar';

interface SettlementRowProps {
  from: Member;
  to: Member;
  amount: number;
  currency: string;
}

/**
 * SettlementRow Component
 * 
 * Displays a single settlement: who owes whom and how much.
 * Visual: [Avatar] ———— $Amount ————> [Avatar]
 * - Left line is straight
 * - Right line has arrow pointing to recipient
 * - Uses Avatar component for consistent styling
 */
const SettlementRow: React.FC<SettlementRowProps> = ({
  from,
  to,
  amount,
  currency,
}) => {
  return (
    <div
      className="flex flex-col py-6 px-4 border-b border-black"
      style={{ backgroundColor: '#1F1A17' }}
    >
      <div className="flex flex-col gap-2 w-full">
        {/* Top Row: visual flow */}
        <div className="flex items-center justify-between w-full h-10">
          <div className="flex-none">
            <Avatar
              name={from.name}
              size="md"
              variant="outline"
            />
          </div>

          <div className="flex-1 flex items-center">
            {/* Left Line Segment */}
            <div className="flex-1 h-px bg-prowess-red mx-3" />

            {/* Amount */}
            <div className="text-display text-2xl text-prowess-beige italic flex-none">
              {currency}{Math.round(amount).toLocaleString()}
            </div>

            {/* Right Line Segment + Arrow */}
            <div className="flex-1 flex items-center mx-3 relative">
              <div className="w-full h-px bg-prowess-red" />
              <div className="absolute right-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-prowess-red" />
            </div>
          </div>

          <div className="flex-none">
            <Avatar
              name={to.name}
              size="md"
              variant="outline"
            />
          </div>
        </div>

        {/* Bottom Row: Name labels with Palatino font */}
        <div className="flex justify-between px-1">
          <span
            className="text-[10px] text-prowess-grey truncate max-w-[120px]"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif' }}
          >
            {from.name}
          </span>
          <span
            className="text-[10px] text-prowess-grey truncate max-w-[120px] text-right"
            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif' }}
          >
            {to.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettlementRow;
