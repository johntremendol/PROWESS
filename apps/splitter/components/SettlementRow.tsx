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
    <div className="flex items-center py-6 px-4 bg-[#0a0a0a] border-b border-[#1a1a1a]">
      {/* From Avatar */}
      <Avatar 
        name={from.name} 
        size="md" 
        variant="outline"
      />
      
      {/* Left Line - Straight, no arrow */}
      <div className="flex-1 h-px bg-[#CC342C] mx-4" />
      
      {/* Amount in Center */}
      <div className="text-display text-2xl text-prowess-beige whitespace-nowrap">
        {currency}{Math.round(amount).toLocaleString()}
      </div>
      
      {/* Right Line - With arrow pointing to recipient */}
      <div className="flex-1 h-px bg-[#CC342C] mx-4 relative">
        {/* Arrow Head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#CC342C]" />
      </div>
      
      {/* To Avatar */}
      <Avatar 
        name={to.name} 
        size="md" 
        variant="outline"
      />
    </div>
  );
};

export default SettlementRow;

