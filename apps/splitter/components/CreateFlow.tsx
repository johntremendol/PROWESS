import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from '../../../components/ui/Icons';
import Avatar from './Avatar';

interface TempMember {
  id: string;
  name: string;
}

interface CreateFlowProps {
  initialMemberName?: string;
  onCreateGroup: (name: string, members: TempMember[], currency: string) => void;
  onCancel: () => void;
}

// Comprehensive list of major world currencies with codes for future API integration
const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'dollar $' },
  { code: 'INR', symbol: 'Rs.', label: 'rupee Rs.' },
  { code: 'EUR', symbol: '€', label: 'euro €' },
  { code: 'GBP', symbol: '£', label: 'pound £' },
  { code: 'JPY', symbol: '¥', label: 'yen ¥' },
  { code: 'AUD', symbol: 'A$', label: 'australian $' },
  { code: 'CAD', symbol: 'C$', label: 'canadian $' },
  { code: 'CHF', symbol: 'Fr', label: 'swiss franc' },
  { code: 'CNY', symbol: '¥', label: 'yuan ¥' },
  { code: 'SGD', symbol: 'S$', label: 'singapore $' },
  { code: 'AED', symbol: 'د.إ', label: 'dirham' },
  { code: 'THB', symbol: '฿', label: 'baht ฿' },
];

/**
 * CreateFlow Component
 * 
 * Full-screen group creation flow matching AddExpenseSheet design:
 * - Red banner header
 * - Black content area with GROUP NAME, CURRENCY, MEMBERS sections
 * - Add Members button in red
 * - White CONFIRM button at bottom
 */
const CreateFlow: React.FC<CreateFlowProps> = ({ initialMemberName, onCreateGroup, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<TempMember[]>(
    initialMemberName ? [{ id: 'creator', name: initialMemberName }] : []
  );
  const [isNameEditing, setIsNameEditing] = useState(true);
  const [isMemberInputVisible, setIsMemberInputVisible] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus name input on mount
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    if (isMemberInputVisible) {
      memberInputRef.current?.focus();
    }
  }, [isMemberInputVisible]);

  const handleNameClick = () => {
    setIsNameEditing(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = CURRENCIES.findIndex(c => c.code === e.target.value);
    if (idx !== -1) setCurrencyIndex(idx);
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    setMembers([...members, { id: Date.now().toString(), name: memberName.trim() }]);
    setMemberName('');
    memberInputRef.current?.focus();
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
    if (e.key === 'Escape') {
      setIsMemberInputVisible(false);
      setMemberName('');
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleConfirm = () => {
    if (groupName.trim() && members.length >= 2) {
      onCreateGroup(groupName.trim(), members, CURRENCIES[currencyIndex].symbol);
    }
  };

  const canConfirm = groupName.trim() && members.length >= 2;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Red Header Banner */}
      <div
        className="w-full py-8 relative"
        style={{ backgroundColor: '#CC342C', minHeight: '80px' }}
        onClick={onCancel}
      />

      {/* Black Content Area */}
      <div className="flex-1 bg-black flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-4 space-y-6">

          {/* GROUP NAME Section */}
          <div className="border-b border-prowess-grey/20 pb-3">
            <div className="flex items-end justify-between gap-4">
              <p className="text-label text-xs text-prowess-grey mb-1 flex-none">GROUP NAME</p>
              {isNameEditing ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onBlur={() => setIsNameEditing(false)}
                  placeholder="kasol 2025"
                  className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right flex-1 min-w-0 placeholder:opacity-50 italic"
                />
              ) : (
                <div
                  onClick={handleNameClick}
                  className="text-display text-2xl text-prowess-beige cursor-pointer text-right flex-1 min-w-0 truncate italic"
                  style={{ opacity: groupName ? 1 : 0.5 }}
                >
                  {groupName || 'kasol 2025'}
                </div>
              )}
            </div>
          </div>

          {/* CURRENCY Section */}
          <div className="border-b border-prowess-grey/20 pb-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-label text-xs text-prowess-grey flex-none">CURRENCY</p>
              <div className="flex items-center gap-2">
                {/* Native select styled to match design - text right aligned */}
                <select
                  value={CURRENCIES[currencyIndex].code}
                  onChange={handleCurrencyChange}
                  className="appearance-none bg-transparent text-display text-2xl text-prowess-beige italic cursor-pointer focus:outline-none text-right"
                  style={{
                    fontFamily: 'inherit',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    direction: 'rtl',
                  }}
                >
                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      className="bg-black text-prowess-beige"
                      style={{ direction: 'ltr' }}
                    >
                      {currency.label}
                    </option>
                  ))}
                </select>
                {/* Diamond arrows indicator - far right */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ lineHeight: 0.7 }}>
                  <span className="text-prowess-grey text-[10px]">◆</span>
                  <span className="text-prowess-grey text-[10px] rotate-180">◆</span>
                </div>
              </div>
            </div>
          </div>

          {/* MEMBERS Section */}
          <div className="flex flex-col gap-0">
            <p className="text-label text-xs text-prowess-grey mb-3">MEMBERS</p>

            {/* Add Members Button - Red Bar */}
            <div className="-mx-6">
              {isMemberInputVisible ? (
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ backgroundColor: '#CC342C' }}
                >
                  <button
                    onClick={handleAddMember}
                    className="w-9 h-9 rounded-full border border-prowess-beige/50 flex items-center justify-center hover:bg-prowess-beige/10 transition-colors flex-shrink-0"
                  >
                    <Plus size={18} className="text-prowess-beige" />
                  </button>
                  <input
                    ref={memberInputRef}
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    onKeyDown={handleMemberKeyDown}
                    onBlur={() => {
                      if (!memberName.trim()) {
                        setIsMemberInputVisible(false);
                      }
                    }}
                    placeholder="member name"
                    className="flex-1 bg-transparent py-2 text-lg text-prowess-beige placeholder-prowess-beige/50 focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsMemberInputVisible(true)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:brightness-110 transition-all"
                  style={{ backgroundColor: '#CC342C' }}
                >
                  <div className="w-9 h-9 rounded-full border border-prowess-beige/50 flex items-center justify-center">
                    <Plus size={18} className="text-prowess-beige" />
                  </div>
                  <span className="text-display text-xl text-prowess-beige italic">Add Members</span>
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="-mx-6 flex flex-col" style={{ gap: 0 }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="w-full flex items-center justify-between px-6 py-4 transition-all bg-[#1F1A17] hover:bg-[#231d19]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      size="md"
                      variant="outline"
                    />
                    <span className="text-display text-lg text-prowess-beige">{member.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-label text-xs text-prowess-grey hover:text-prowess-beige transition-colors uppercase tracking-widest"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section: Confirm Button */}
        <div className="flex-none w-full px-6 pb-6 pt-4 bg-black">
          <button
            onClick={canConfirm ? handleConfirm : onCancel}
            className={`w-full h-[48px] flex items-center justify-center text-label text-sm tracking-widest font-bold uppercase transition-all rounded-none ${canConfirm
              ? 'bg-white text-black hover:brightness-90'
              : 'bg-white text-black hover:brightness-90'
              }`}
          >
            {canConfirm ? 'CONFIRM' : 'CANCEL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFlow;
