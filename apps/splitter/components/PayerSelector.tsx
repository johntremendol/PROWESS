import { useState, useRef } from 'react';
import { Member } from '../../../types';
import Avatar from './Avatar';

interface PayerSelectorProps {
  members: Member[];
  selectedPayers: string[];
  contributions: Record<string, number>;
  totalAmount: number;
  onPayersChange: (payers: string[]) => void;
  onContributionChange: (memberId: string, amount: number) => void;
  currency: string;
}

/**
 * PayerSelector Component
 * 
 * Multi-select payer interface with:
 * - Toggle members as payers
 * - Auto-split total amount equally among selected payers
 * - Inline contribution editing for precision control
 * - Visual feedback for selected/unselected state
 */
const PayerSelector: React.FC<PayerSelectorProps> = ({
  members,
  selectedPayers,
  contributions,
  totalAmount,
  onPayersChange,
  onContributionChange,
  currency,
}) => {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePayer = (memberId: string) => {
    if (selectedPayers.includes(memberId)) {
      // Remove payer
      onPayersChange(selectedPayers.filter(id => id !== memberId));
    } else {
      // Add payer
      onPayersChange([...selectedPayers, memberId]);
    }
  };

  const handleContributionClick = (memberId: string, currentAmount: number) => {
    setEditingMember(memberId);
    setEditValue(currentAmount.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleContributionBlur = () => {
    if (editingMember) {
      const numValue = parseFloat(editValue) || 0;
      onContributionChange(editingMember, numValue);
      setEditingMember(null);
    }
  };

  const handleContributionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleContributionBlur();
    }
  };

  const formatAmount = (amount: number): string => {
    return `${currency}${Math.round(amount).toLocaleString()}`;
  };

  // Show settlement-style row for multi-payer splits
  const renderMultiPayerSplit = () => {
    if (selectedPayers.length < 2) return null;

    const payer1 = members.find(m => m.id === selectedPayers[0]);
    const payer2 = members.find(m => m.id === selectedPayers[1]);
    
    if (!payer1 || !payer2) return null;

    const contribution1 = contributions[selectedPayers[0]] || 0;
    const contribution2 = contributions[selectedPayers[1]] || 0;

    return (
      <div className="mt-4 flex items-center py-4 px-4 bg-prowess-dark-warm border border-black rounded-lg">
        <Avatar name={payer1.name} size="md" variant="outline" />
        <div className="flex-1 h-px bg-prowess-red mx-3" />
        <div className="text-display text-xl text-prowess-beige whitespace-nowrap">
          {formatAmount(contribution1 + contribution2)}
        </div>
        <div className="flex-1 h-px bg-prowess-red mx-3" />
        <div className="flex -space-x-2">
          <Avatar name={payer1.name} size="md" variant="outline" />
          <Avatar name={payer2.name} size="md" variant="outline" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Member Selection */}
      {members.map((member) => {
        const isSelected = selectedPayers.includes(member.id);
        const contribution = contributions[member.id] || 0;
        const isEditing = editingMember === member.id;

        return (
          <div
            key={member.id}
            className={`
              flex items-center justify-between py-3 px-4 rounded-lg 
              transition-all cursor-pointer border
              ${
                isSelected
                  ? 'bg-prowess-dark-warm border-prowess-beige/30'
                  : 'bg-transparent border-prowess-grey/10 hover:border-prowess-grey/30'
              }
            `}
            onClick={() => !isEditing && togglePayer(member.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar
                name={member.name}
                size="md"
                variant={isSelected ? 'filled' : 'outline'}
              />
              <span className={`text-prowess-beige ${!isSelected && 'opacity-60'}`}>
                {member.name}
              </span>
            </div>

            {isSelected && totalAmount > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setEditValue(val);
                      }
                    }}
                    onBlur={handleContributionBlur}
                    onKeyDown={handleContributionKeyDown}
                    className="w-24 text-right text-prowess-beige bg-transparent border-b border-prowess-red outline-none"
                  />
                ) : (
                  <div
                    onClick={() => handleContributionClick(member.id, contribution)}
                    className="text-prowess-beige cursor-pointer hover:text-prowess-red transition-colors"
                  >
                    {formatAmount(contribution)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Multi-Payer Split Visualization */}
      {renderMultiPayerSplit()}
    </div>
  );
};

export default PayerSelector;

