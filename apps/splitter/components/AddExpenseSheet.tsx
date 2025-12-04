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
        {/* Scalloped Edge & Title Header */}
        <div className="relative w-full">
          {/* Scalloped Edge SVG - Positioned to overlap the top */}
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

          {/* Add Expense Title */}
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-label text-xs text-prowess-beige tracking-widest uppercase">ADD EXPENSE</h2>
          </div>
        </div>

        {/* Scrollable Content (Form Fields) */}
        <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 space-y-8">
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
          <div className="h-[300px]"></div>
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
              className="w-full py-4 bg-white text-black text-label text-sm tracking-widest font-bold uppercase disabled:bg-prowess-grey disabled:opacity-100 disabled:cursor-not-allowed hover:brightness-90 transition-all"
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


