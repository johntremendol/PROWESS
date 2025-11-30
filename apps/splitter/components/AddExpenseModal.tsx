import { useState, useEffect, useRef } from 'react';
import { Member, Expense } from '../../../types';
import Avatar from './Avatar';
import splitterLogo from '../../../src/assets/splitterlogo.png';

interface AddExpenseModalProps {
  members: Member[];
  currency: string;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

/**
 * Modal for adding a new expense.
 * Full-screen red panel with form inputs.
 */
const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  members,
  currency,
  onAdd,
  onClose,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  const descRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    descRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidBy) {
      alert('Please fill in all fields');
      return;
    }

    onAdd({
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      date: new Date().toISOString().split('T')[0],
      category: 'General',
    });
  };

  const canSubmit = description.trim() && amount && paidBy;

  return (
    <div
      className={`fixed inset-0 bg-prowess-red z-50 flex flex-col transition-transform duration-300 ${
        isClosing ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={handleClose}
          className="text-prowess-beige/60 hover:text-prowess-beige text-sm transition-colors"
        >
          Cancel
        </button>
        <img src={splitterLogo} alt="Splitter" className="w-10 h-10 object-contain" />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="text-prowess-beige text-sm disabled:opacity-40 transition-opacity"
        >
          Add
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col p-6">
        {/* Description */}
        <div className="mb-6">
          <label className="text-black/50 text-xs uppercase tracking-widest mb-2 block">
            Description
          </label>
          <input
            ref={descRef}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for?"
            className="w-full bg-transparent border-b border-black/20 py-3 text-xl text-black placeholder-black/40 focus:border-black focus:outline-none transition-colors text-display"
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="text-black/50 text-xs uppercase tracking-widest mb-2 block">
            Amount
          </label>
          <div className="flex items-center gap-2">
            <span className="text-black/60 text-xl">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent border-b border-black/20 py-3 text-3xl text-black placeholder-black/40 focus:border-black focus:outline-none transition-colors text-display"
            />
          </div>
        </div>

        {/* Paid By */}
        <div className="mb-6">
          <label className="text-black/50 text-xs uppercase tracking-widest mb-4 block">
            Paid By
          </label>
          <div className="flex flex-wrap gap-3">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => setPaidBy(member.id)}
                className={`flex items-center gap-2 py-2 px-4 border transition-colors ${
                  paidBy === member.id
                    ? 'border-black bg-black text-prowess-red'
                    : 'border-black/30 text-black hover:border-black'
                }`}
              >
                <Avatar
                  name={member.name}
                  size="sm"
                  variant={paidBy === member.id ? 'filled' : 'outline'}
                />
                <span>{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        {canSubmit && (
          <div className="mt-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 border border-black text-black uppercase tracking-widest text-sm hover:bg-black hover:text-prowess-red transition-colors"
            >
              Add Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;

