import { useState, useEffect, useRef } from 'react';
import { Member, Expense } from '../../../types';
import RotatingDial from './RotatingDial';
import CategoryChipSelector from './CategoryChipSelector';
import PayerSelector from './PayerSelector';


interface AddExpenseSheetProps {
  members: Member[];
  currency: string;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

/**
 * AddExpenseSheet Component
 * 
 * Bottom sheet for adding expenses with:
 * - Rotating dial for amount input with velocity-based increments
 * - Inline title editing
 * - Category chip selector with custom categories
 * - Multi-payer selection with auto-split and inline contribution editing
 * - Live settlement preview for non-payers
 * - Smooth animations and red backdrop
 */
const AddExpenseSheet: React.FC<AddExpenseSheetProps> = ({
  members,
  currency,
  onAdd,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [payerContributions, setPayerContributions] = useState<Record<string, number>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';

    // Auto-focus title input for quick editing
    setTimeout(() => {
      titleInputRef.current?.focus();
      setIsTitleEditing(true);
    }, 400); // Delay to allow sheet animation to complete

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-split contributions when payers or total amount changes
  useEffect(() => {
    if (selectedPayers.length > 0 && totalAmount > 0) {
      const splitAmount = totalAmount / selectedPayers.length;
      const newContributions: Record<string, number> = {};
      selectedPayers.forEach(payerId => {
        newContributions[payerId] = splitAmount;
      });
      setPayerContributions(newContributions);
    }
  }, [selectedPayers, totalAmount]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleConfirm = () => {
    if (!title.trim() || totalAmount <= 0 || selectedPayers.length === 0) {
      return;
    }

    // For now, use the first payer as the main payer (backward compatibility)
    // TODO: Update backend to support multiple payers
    onAdd({
      description: title.trim(),
      amount: totalAmount,
      paidBy: selectedPayers[0],
      date: new Date().toISOString().split('T')[0],
      category: category,
    });

    handleClose();
  };

  const handlePayersChange = (payers: string[]) => {
    setSelectedPayers(payers);
  };

  const handleContributionChange = (memberId: string, amount: number) => {
    setPayerContributions(prev => ({
      ...prev,
      [memberId]: amount,
    }));
  };

  const handleTitleClick = () => {
    setIsTitleEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const canConfirm = title.trim() && totalAmount > 0 && selectedPayers.length > 0;

  return (
    <>
      {/* Red Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-90'
          }`}
        style={{ backgroundColor: '#CC342C' }}
        onClick={handleClose}
      />

      {/* Sheet Content */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-black flex flex-col transition-transform duration-400 ${isClosing ? 'translate-y-full' : 'translate-y-0'
          }`}
        style={{
          height: '90vh', // Fixed height for the sheet
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Scrollable Content (Form Fields) */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 space-y-8">
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
                  placeholder="renly's diner"
                  className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right flex-1 min-w-0 placeholder:opacity-50"
                />
              ) : (
                <div
                  onClick={handleTitleClick}
                  className="text-display text-2xl text-prowess-beige cursor-pointer text-right flex-1 min-w-0 truncate"
                  style={{ opacity: title ? 1 : 0.5 }}
                >
                  {title || 'renly\'s diner'}
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
              onCustomCategoryAdd={(newCat: string) => {
                setCustomCategories([newCat, ...customCategories]);
                setCategory(newCat);
              }}
            />
          </div>

          {/* Paid By Section */}
          <div>
            <p className="text-label text-xs text-prowess-grey mb-4">PAID BY</p>
            <PayerSelector
              members={members}
              selectedPayers={selectedPayers}
              contributions={payerContributions}
              totalAmount={totalAmount}
              onPayersChange={handlePayersChange}
              onContributionChange={handleContributionChange}
              currency={currency}
            />
          </div>
        </div>

        {/* Fixed Bottom Section: Gradient + Dial + Confirm Button */}
        <div className="flex-none relative w-full flex flex-col items-center justify-end pb-6 bg-black">


          {/* Dial - Positioned absolutely at bottom */}
          <RotatingDial
            value={totalAmount}
            onChange={setTotalAmount}
            currency={currency}
            min={0}
            max={1000000}
          />

          {/* Gradient Overlay - Behind button, in front of wheel */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              zIndex: 15,
              height: '100px', // Covers button height + padding + ~20px extra
              background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Confirm Button */}
          <div className="w-full px-6 z-20">
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full py-4 bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-90 transition-all"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddExpenseSheet;


