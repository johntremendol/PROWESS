import { useState, useEffect, useRef } from 'react';
import { Member, Expense } from '../../../types';
import RotatingDial from './RotatingDial';
import CategoryChipSelector from './CategoryChipSelector';
import PayerSelector from './PayerSelector';
import LiveSettlementPreview from './LiveSettlementPreview';

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
        // Keep existing contribution if it exists, otherwise use split amount
        newContributions[payerId] = payerContributions[payerId] ?? splitAmount;
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
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-90'
        }`}
        style={{ backgroundColor: '#CC342C' }}
        onClick={handleClose}
      />

      {/* Sheet Content */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-black transition-transform duration-400 ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{
          maxHeight: '95vh',
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Scalloped Top Edge */}
        <div
          className="w-full h-10"
          style={{
            background: `
              radial-gradient(circle at 0% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 10% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 20% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 30% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 40% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 50% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 60% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 70% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 80% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 90% 0%, transparent 20px, #CC342C 20px),
              radial-gradient(circle at 100% 0%, transparent 20px, #CC342C 20px),
              #CC342C
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
          }}
        />

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 40px)' }}>
          <div className="px-6 py-6 space-y-8">
            {/* Title Section */}
            <div>
              <p className="text-label text-xs text-prowess-grey mb-3">TITLE</p>
              <div className="flex items-center border-b border-prowess-grey/20 pb-2">
                <div className="flex-1" />
                {isTitleEditing ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsTitleEditing(false)}
                    placeholder="renly's diner"
                    className="text-display text-2xl text-prowess-beige bg-transparent outline-none text-right w-full"
                  />
                ) : (
                  <div
                    onClick={handleTitleClick}
                    className="text-display text-2xl text-prowess-beige cursor-pointer text-right w-full"
                  >
                    {title || 'renly\'s diner'}
                  </div>
                )}
              </div>
            </div>

            {/* Category Section */}
            <div>
              <p className="text-label text-xs text-prowess-grey mb-3">CATEGORY</p>
              <div className="border-b border-prowess-grey/20 pb-3 mb-3">
                <div className="text-display text-2xl text-prowess-beige text-right">
                  {category}
                </div>
              </div>
              <CategoryChipSelector
                selectedCategory={category}
                customCategories={customCategories}
                onCategorySelect={setCategory}
                onCustomCategoryAdd={(newCat) => {
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

            {/* Amount Dial */}
            <div className="py-8">
              <RotatingDial
                value={totalAmount}
                onChange={setTotalAmount}
                currency={currency}
                min={0}
                max={1000000}
              />
            </div>

            {/* Live Settlement Preview */}
            {selectedPayers.length > 0 && totalAmount > 0 && (
              <LiveSettlementPreview
                members={members}
                selectedPayers={selectedPayers}
                contributions={payerContributions}
                totalAmount={totalAmount}
                currency={currency}
              />
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full py-4 bg-white text-black text-label text-sm tracking-widest rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 transition-all"
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

