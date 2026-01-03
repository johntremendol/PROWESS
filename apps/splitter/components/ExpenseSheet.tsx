import { useState, useEffect, useRef } from 'react';
import { Member, Expense, PayerContribution } from '../../../types';
import RotatingDial from './RotatingDial';
import CategoryChipSelector from './CategoryChipSelector';
import Avatar from './Avatar';

interface ExpenseSheetProps {
  expense: Expense | null;
  members: Member[];
  currency: string;
  customCategories?: string[];
  onUpdate?: (updatedExpense: Expense) => void;
  onCustomCategoryAdd?: (category: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

/**
 * ExpenseSheet Component (Edit Mode)
 * 
 * Bottom sheet for viewing and editing expenses.
 * Fully supports multi-payer and custom split logic matching AddExpenseSheet.
 */
const ExpenseSheet: React.FC<ExpenseSheetProps> = ({
  expense,
  members,
  currency,
  customCategories = [],
  onUpdate,
  onCustomCategoryAdd,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');

  // Multi-payer state
  const [payerContributions, setPayerContributions] = useState<Record<string, number>>({});
  const [focusedPayerId, setFocusedPayerId] = useState<string | null>(null);

  const [splitMembers, setSplitMembers] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Separate effect for entrance animation to avoid re-triggering on expense updates
  useEffect(() => {
    // Reset visibility first to ensure animation plays if component is re-mounted quickly
    setIsVisible(false);
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []); // Run only on mount

  // Initialize state when expense changes
  useEffect(() => {
    if (expense) {
      setTitle(expense.description);
      setCategory(expense.category || 'food');
      setTotalAmount(expense.amount);

      // Initialize Payers
      const initialContributions: Record<string, number> = {};
      if (Array.isArray(expense.paidBy)) {
        expense.paidBy.forEach(p => {
          initialContributions[p.memberId] = p.amount;
        });
      } else if (typeof expense.paidBy === 'string') {
        // Legacy single payer
        initialContributions[expense.paidBy] = expense.amount;
      }
      setPayerContributions(initialContributions);

      // Initialize Splits
      if (expense.splitBetween && expense.splitBetween.length > 0) {
        setSplitMembers(expense.splitBetween);
      } else {
        // Default to all members if no split data exists (backward compatibility)
        setSplitMembers(members.map(m => m.id));
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset state
      setPayerContributions({});
      setSplitMembers([]);
      setTotalAmount(0);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [expense, members]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const calculateTotal = (contributions: Record<string, number>) => {
    return Object.values(contributions).reduce((sum, val) => sum + val, 0);
  };

  const handleUpdate = () => {
    const payerIds = Object.keys(payerContributions);
    if (!expense || !title.trim() || totalAmount <= 0 || payerIds.length === 0 || splitMembers.length === 0) {
      return;
    }

    // Prepare paidBy payload
    let paidByPayload: string | PayerContribution[];
    // We can switch to always using array for consistency, or keep compatibility logic
    // Using array is safer for 'complex scenarios'
    paidByPayload = payerIds.map(id => ({
      memberId: id,
      amount: payerContributions[id]
    }));

    if (onUpdate) {
      onUpdate({
        ...expense,
        description: title.trim(),
        amount: totalAmount,
        paidBy: paidByPayload,
        splitBetween: splitMembers,
        category: category,
      });
    }

    handleClose();
  };

  const handleTitleClick = () => {
    setIsTitleEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  // --- Payer Logic ---
  const togglePayer = (memberId: string) => {
    setPayerContributions(prev => {
      const next = { ...prev };
      if (next[memberId] !== undefined) {
        delete next[memberId];
        if (focusedPayerId === memberId) setFocusedPayerId(null);
      } else {
        next[memberId] = 0;
      }

      // Redistribute total amount among new set of payers
      const payerIds = Object.keys(next);
      if (payerIds.length > 0 && totalAmount > 0) {
        const share = totalAmount / payerIds.length;
        payerIds.forEach(id => next[id] = share);
      }
      return next;
    });
  };

  const handlePayerAmountClick = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (payerContributions[memberId] === undefined) {
      togglePayer(memberId);
    }
    setFocusedPayerId(prev => prev === memberId ? null : memberId);
  };

  // --- Dial Logic ---
  const handleDialChange = (newValue: number) => {
    if (focusedPayerId && payerContributions[focusedPayerId] !== undefined) {
      setPayerContributions(prev => {
        const next = { ...prev, [focusedPayerId]: newValue };
        setTotalAmount(calculateTotal(next));
        return next;
      });
    } else {
      setTotalAmount(newValue);
      setPayerContributions(prev => {
        const payerIds = Object.keys(prev);
        if (payerIds.length === 0) return prev;

        const next = { ...prev };
        const share = newValue / payerIds.length;
        payerIds.forEach(id => next[id] = share);
        return next;
      });
    }
  };

  const toggleSplitMember = (memberId: string) => {
    setSplitMembers(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const splitShare = splitMembers.length > 0 ? totalAmount / splitMembers.length : 0;

  const formatMoney = (amount: number): string => {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  };

  if (!expense) return null;

  const canUpdate = title.trim() && totalAmount > 0 && Object.keys(payerContributions).length > 0 && splitMembers.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ease-out-quint ${!isVisible || isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundColor: 'rgba(214, 207, 191, 0.25)', // D6CFBF at 25% opacity
          backdropFilter: 'blur(1px)',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
        }}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-black flex flex-col transition-transform duration-500 ${!isVisible || isClosing ? 'translate-y-full' : 'translate-y-0'}`}
        style={{
          height: '80vh',
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
        }}
        onClick={() => setFocusedPayerId(null)}
      >
        <div className="relative w-full flex-none">
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-2 pb-4 space-y-8">
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
                  className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right flex-1 min-w-0 placeholder:opacity-50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  onClick={(e) => { e.stopPropagation(); handleTitleClick(); }}
                  className="text-display text-2xl text-prowess-beige cursor-pointer text-right flex-1 min-w-0 truncate"
                >
                  {title}
                </div>
              )}
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
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
          <div className="flex flex-col gap-0">
            <p className="text-label text-xs text-prowess-grey mb-4">PAID BY</p>
            <div className="-mx-6 flex flex-col" style={{ gap: 0 }}>
              {members.map((member) => {
                const isPayer = payerContributions[member.id] !== undefined;
                const contribution = payerContributions[member.id] || 0;
                const isFocused = focusedPayerId === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={(e) => { e.stopPropagation(); togglePayer(member.id); }}
                    className={`w-full flex items-center justify-between px-6 py-3 transition-colors m-0 cursor-pointer border-b border-prowess-grey/5 ${isPayer ? 'bg-[#1F1A17]' : 'bg-transparent'} hover:bg-[#231d19]`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.name}
                        size="md"
                        variant={isPayer ? 'filled' : 'outline'}
                      />
                      <span className={`text-display text-lg ${isPayer ? 'text-prowess-beige' : 'text-prowess-grey'}`}>
                        {member.name}
                      </span>
                    </div>

                    <div
                      onClick={(e) => handlePayerAmountClick(e, member.id)}
                      className={`text-display text-lg cursor-pointer px-2 py-1 rounded transition-colors ${isFocused ? 'bg-prowess-red text-white' : (isPayer ? 'text-prowess-beige' : 'text-prowess-grey/50')}`}
                    >
                      {formatMoney(contribution)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Split In Section */}
          <div className="flex flex-col gap-0">
            <p className="text-label text-xs text-prowess-grey mb-3">SPLIT IN</p>
            <div className="-mx-4 flex flex-col" style={{ gap: 0 }}>
              {members.map((member) => {
                const isIncluded = splitMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={(e) => { e.stopPropagation(); toggleSplitMember(member.id); }}
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
                      {isIncluded ? formatMoney(splitShare) : `${currency} 0`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delete Button */}
          <div className="pt-4 px-0">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this expense?')) {
                  onDelete?.();
                  onClose();
                }
              }}
              className="w-full h-[50px] flex items-center justify-center bg-prowess-red text-prowess-beige text-label text-sm tracking-widest font-bold uppercase hover:brightness-90 transition-all rounded-none"
            >
              delete expense
            </button>
          </div>

          <div className="h-[300px]"></div>
        </div>

        <div
          className="flex-none relative w-full flex flex-col items-center justify-end pb-6 bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {focusedPayerId && (
            <div className="absolute top-0 left-0 w-full text-center pb-2">
              <p className="text-label text-xs text-prowess-red tracking-widest uppercase animate-pulse">
                SET AMOUNT FOR {members.find(m => m.id === focusedPayerId)?.name}
              </p>
            </div>
          )}

          <RotatingDial
            value={focusedPayerId ? (payerContributions[focusedPayerId] || 0) : totalAmount}
            onChange={handleDialChange}
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
              className="w-full h-[42px] flex items-center justify-center bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:bg-prowess-grey disabled:opacity-100 disabled:cursor-not-allowed hover:brightness-90 transition-all rounded-none"
            >
              UPDATE
            </button>
          </div>
        </div>
      </div >
    </>
  );
};

export default ExpenseSheet;
