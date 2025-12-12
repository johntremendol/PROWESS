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
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="w-full">
      {/* Member Selection */}
      {members.map((member) => {
        const isSelected = selectedPayers.includes(member.id);
        const contribution = contributions[member.id] || 0;
        const isEditing = editingMember === member.id;

        return (
          <div
            key={member.id}
            className={`flex items-center justify-between py-4 px-4 transition-all cursor-pointer ${isSelected ? '' : 'border-b border-prowess-grey/20'
              }`}
            style={{
              backgroundColor: isSelected ? '#1F1A17' : '#000000',
              marginLeft: '-24px',
              marginRight: '-24px',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}
            onClick={() => !isEditing && togglePayer(member.id)}
          >
            <div className="flex items-center gap-4">
              <Avatar
                name={member.name}
                size="md"
                variant={isSelected ? 'filled' : 'outline'}
              />
              <span className="text-display text-xl text-prowess-beige">
                {member.name}
              </span>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              {isSelected && totalAmount > 0 ? (
                isEditing ? (
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
                    className="w-32 text-right text-display text-xl text-prowess-beige bg-transparent border-b border-prowess-red outline-none"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleContributionClick(member.id, contribution)}
                    className="text-display text-xl text-prowess-beige cursor-pointer hover:text-prowess-red transition-colors"
                  >
                    {formatAmount(contribution)}
                  </div>
                )
              ) : (
                <div className="text-display text-xl text-prowess-beige opacity-0">
                  {formatAmount(0)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PayerSelector;







