import { useState, useEffect, useRef } from 'react';
import { Member, Expense } from '../../../types';
import RotatingDial from './RotatingDial';
import CategoryChipSelector from './CategoryChipSelector';
import Avatar from './Avatar';

interface ExpenseSheetProps {
  expense: Expense | null;
  members: Member[];
  currency: string;
  customCategories?: string[]; // Added to match AddExpenseSheet
  onUpdate?: (updatedExpense: Expense) => void; // Added for editing
  onCustomCategoryAdd?: (category: string) => void; // Added for editing
  onClose: () => void;
}

/**
 * ExpenseSheet Component (Edit Mode)
 * 
 * Bottom sheet for viewing and editing expenses.
 * Matches the visual style of AddExpenseSheet.
 */
const ExpenseSheet: React.FC<ExpenseSheetProps> = ({
  expense,
  members,
  currency,
  customCategories = [],
  onUpdate,
  onCustomCategoryAdd,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);
  const [splitMembers, setSplitMembers] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when expense changes
  useEffect(() => {
    if (expense) {
      setTitle(expense.description);
      setCategory(expense.category || 'food');
      // Handle legacy paidBy (string) vs multi-payer (array - not fully supported yet but just in case)
      const payerId = typeof expense.paidBy === 'string' ? expense.paidBy : expense.paidBy[0]?.memberId;
      setSelectedPayer(payerId);
      setTotalAmount(expense.amount);

      // Default split to everyone for now, as we don't persist split details
      // If we did, we'd load it here.
      setSplitMembers(members.map(m => m.id));

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [expense, members]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false); // Reset for next open
    }, 400);
  };

  const handleUpdate = () => {
    if (!expense || !title.trim() || totalAmount <= 0 || !selectedPayer || splitMembers.length === 0) {
      return;
    }

    if (onUpdate) {
      onUpdate({
        ...expense,
        description: title.trim(),
        amount: totalAmount,
        paidBy: selectedPayer,
        category: category,
      });
    }

    handleClose();
  };

  const handleTitleClick = () => {
    setIsTitleEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const toggleSplitMember = (memberId: string) => {
    setSplitMembers(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const splitShare = splitMembers.length > 0 ? totalAmount / splitMembers.length : 0;

  const formatShare = (amount: number): string => {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  };

  if (!expense) return null;

  const canUpdate = title.trim() && totalAmount > 0 && selectedPayer && splitMembers.length > 0;

  return (
    <>
      {/* Red Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-90'}`}
        style={{ backgroundColor: '#CC342C' }}
        onClick={handleClose}
      />

      {/* Sheet Content */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-black flex flex-col transition-transform duration-400 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
        style={{
          height: '80vh',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Scalloped Edge & Header */}
        <div className="relative w-full">
          <div className="absolute top-[-36px] left-0 w-full overflow-hidden leading-none z-50">
            <svg
              className="w-full h-[37px] text-black fill-current"
              viewBox="0 0 430 37"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.41797 0C6.72416 4.61649 10.9653 8 16 8C21.0347 8 25.2758 4.61649 26.582 0H44.418C45.7242 4.61649 49.9653 8 55 8C60.0347 8 64.2758 4.61649 65.582 0H83.418C84.7242 4.61649 88.9653 8 94 8C99.0347 8 103.276 4.61649 104.582 0H122.418C123.724 4.61649 127.965 8 133 8C138.035 8 142.276 4.61649 143.582 0H161.418C162.724 4.61649 166.965 8 172 8C177.035 8 181.276 4.61649 182.582 0H200.418C201.724 4.61649 205.965 8 211 8C216.035 8 220.276 4.61649 221.582 0H239.418C240.724 4.61649 244.965 8 250 8C255.035 8 259.276 4.61649 260.582 0H278.418C279.724 4.61649 283.965 8 289 8C294.035 8 298.276 4.61649 299.582 0H317.418C318.724 4.61649 322.965 8 328 8C333.035 8 337.276 4.61649 338.582 0H356.418C357.724 4.61649 361.965 8 367 8C372.035 8 376.276 4.61649 377.582 0H395.418C396.724 4.61649 400.965 8 406 8C411.035 8 415.276 4.61649 416.582 0H430V37H0V0H5.41797Z" />
            </svg>
          </div>

          <div className="px-6 pt-6 pb-2">
            <h2 className="text-label text-xs text-prowess-beige tracking-widest uppercase">EDIT EXPENSE</h2>
          </div>
        </div>

        {/* Scrollable Content (Form Fields) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-2 pb-4 space-y-8">
          {/* Title Section */}
          <div className="border-b border-prowess-grey/20 pb-2">
            <div className="flex items-end justify-between gap-4">
              <p className="text-label text-xs text-prowess-grey mb-1 flex-none">TITLE</p>
              {isTitleEditing ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsTitleEditing(false)}
                  className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right flex-1 min-w-0"
                />
              ) : (
                <div
                  onClick={handleTitleClick}
                  className="text-display text-2xl text-prowess-beige cursor-pointer text-right flex-1 min-w-0 truncate"
                >
                  {title}
                </div>
              )}
            </div>
          </div>

          {/* Category Section */}
          <div>
            <p className="text-label text-xs text-prowess-grey mb-3">CATEGORY</p>
            <CategoryChipSelector
              selectedCategory={category}
              customCategories={customCategories}
              onCategorySelect={setCategory}
              onCustomCategoryAdd={(newCat) => {
                onCustomCategoryAdd?.(newCat);
                setCategory(newCat);
              }}
            />
          </div>

          {/* Paid By Section */}
          <div>
            <p className="text-label text-xs text-prowess-grey mb-4">PAID BY</p>
            <div className="flex items-center gap-3">
              {members.map((member) => {
                const isSelected = selectedPayer === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedPayer(member.id)}
                    className={`rounded-full transition-all ${isSelected ? 'ring-2 ring-prowess-beige/60' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <Avatar
                      name={member.name}
                      size="md"
                      variant={isSelected ? 'filled' : 'outline'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split In Section */}
          <div className="flex flex-col gap-0">
            <p className="text-label text-xs text-prowess-grey">SPLIT IN</p>
            <div className="-mx-4 flex flex-col" style={{ gap: 0 }}>
              {members.map((member) => {
                const isIncluded = splitMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleSplitMember(member.id)}
                    className={`w-full flex items-center justify-between px-6 py-3 transition-all border-0 outline-none focus:outline-none focus:ring-0 m-0 ${isIncluded ? 'bg-[#1F1A17]' : 'bg-black'} hover:bg-[#231d19]`}
                    style={{ margin: 0, border: 'none', boxShadow: 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.name}
                        size="sm"
                        variant={isIncluded ? 'filled' : 'outline'}
                      />
                      <span className="text-display text-lg text-prowess-beige">{member.name}</span>
                    </div>
                    <span className="text-display text-lg text-prowess-beige">
                      {isIncluded ? formatShare(splitShare) : `${currency} 0`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-[300px]"></div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-none relative w-full flex flex-col items-center justify-end pb-6 bg-black">
          <RotatingDial
            value={totalAmount}
            onChange={setTotalAmount}
            currency={currency}
            min={0}
            max={1000000}
          />

          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              zIndex: 15,
              height: '100px',
              background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0) 100%)',
            }}
          />

          <div className="w-full px-6 z-20">
            <button
              onClick={handleUpdate}
              disabled={!canUpdate}
              className="w-full h-[42px] flex items-center justify-center bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:bg-prowess-grey disabled:opacity-100 disabled:cursor-not-allowed hover:brightness-90 transition-all"
            >
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseSheet;
