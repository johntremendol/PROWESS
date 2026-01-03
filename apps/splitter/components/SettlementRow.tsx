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
        <div className="flex items-center justify-between w-full relative h-10">
          <div className="z-10 bg-[#1F1A17]">
            <Avatar
              name={from.name}
              size="md"
              variant="outline"
            />
          </div>

          <div className="absolute left-4 right-4 h-px bg-prowess-red z-0" />

          <div className="bg-[#1F1A17] px-3 z-10">
            <div className="text-display text-2xl text-prowess-beige italic">
              {currency}{Math.round(amount).toLocaleString()}
            </div>
          </div>

          <div className="z-10 bg-[#1F1A17] relative">
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-prowess-red" />
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
