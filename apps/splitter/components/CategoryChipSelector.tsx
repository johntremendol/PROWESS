import { useState, useEffect, useRef } from 'react';

interface CategoryChipSelectorProps {
  selectedCategory: string;
  customCategories: string[];
  onCategorySelect: (category: string) => void;
  onCustomCategoryAdd: (category: string) => void;
}

const DEFAULT_CATEGORIES = ['food', 'travel', 'stay', 'miscellaneous'];

/**
 * CategoryChipSelector Component
 * 
 * Horizontal scrollable category selector with:
 * - Predefined category chips
 * - Custom category creation
 * - Selected chip highlighted in beige
 * - New custom categories appear at the front
 */
const CategoryChipSelector: React.FC<CategoryChipSelectorProps> = ({
  selectedCategory,
  customCategories,
  onCategorySelect,
  onCustomCategoryAdd,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allCategories = [...customCategories, ...DEFAULT_CATEGORIES];

  const handleCreateSubmit = () => {
    if (newCategoryName.trim()) {
      const trimmed = newCategoryName.trim().toLowerCase();
      if (!allCategories.includes(trimmed)) {
        onCustomCategoryAdd(trimmed);
      } else {
        onCategorySelect(trimmed);
      }
    }
    setIsCreating(false);
    setNewCategoryName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewCategoryName('');
    }
  };

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  return (
    <div
      className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide font-serif -mx-6 px-6"
      style={{ fontFamily: 'Palatino, serif' }}
    >
      {/* New Category Chip - First Item */}
      {isCreating ? (
        <input
          ref={inputRef}
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onBlur={handleCreateSubmit}
          onKeyDown={handleKeyDown}
          className="px-4 py-2 bg-transparent text-prowess-beige border border-prowess-beige text-base min-w-[80px] outline-none placeholder:text-prowess-grey/50 rounded"
          placeholder="name..."
          style={{ fontFamily: 'Palatino, serif' }}
        />
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-transparent text-prowess-grey border border-prowess-grey/30 text-sm flex-shrink-0 transition-all hover:border-prowess-grey/50 hover:text-prowess-beige rounded flex items-center gap-1"
          style={{ fontFamily: 'Palatino, serif' }}
        >
          <span className="text-lg leading-none">+</span> New
        </button>
      )}

      {/* Existing Categories */}
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategorySelect(cat)}
          className={`
            px-4 py-2 whitespace-nowrap text-sm transition-all flex-shrink-0 rounded
            ${selectedCategory === cat
              ? 'bg-prowess-beige text-black'
              : 'bg-transparent text-prowess-grey border border-prowess-grey/30 hover:border-prowess-grey/50'
            }
          `}
          style={{ fontFamily: 'Palatino, serif' }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryChipSelector;





