import { useState, useRef } from 'react';

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
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allCategories = [...customCategories, ...DEFAULT_CATEGORIES];

  const handleCustomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customInput.trim()) {
      const newCategory = customInput.trim().toLowerCase();
      
      // Check if category already exists
      if (!allCategories.includes(newCategory)) {
        onCustomCategoryAdd(newCategory);
      } else {
        onCategorySelect(newCategory);
      }
      
      setCustomInput('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategorySelect(cat)}
          className={`
            px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all flex-shrink-0
            ${
              selectedCategory === cat
                ? 'bg-prowess-beige text-black'
                : 'bg-stone-800 text-prowess-beige hover:bg-stone-700'
            }
          `}
        >
          {cat}
        </button>
      ))}
      
      {/* Custom Category Input */}
      <input
        ref={inputRef}
        type="text"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        onKeyDown={handleCustomInputKeyDown}
        placeholder="custom..."
        className="
          px-4 py-2 rounded-full bg-stone-800/50 text-prowess-beige 
          placeholder-prowess-grey/50 text-sm outline-none 
          border border-stone-700 focus:border-prowess-beige 
          transition-colors flex-shrink-0 min-w-32
        "
      />
    </div>
  );
};

export default CategoryChipSelector;

