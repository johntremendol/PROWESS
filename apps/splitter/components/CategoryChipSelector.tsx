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
  const allCategories = [...customCategories, ...DEFAULT_CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategorySelect(cat)}
          className={`
            px-4 py-2 whitespace-nowrap text-sm transition-all flex-shrink-0
            ${selectedCategory === cat
              ? 'bg-prowess-beige text-black'
              : 'bg-transparent text-prowess-grey border border-prowess-grey/30'
            }
          `}
        >
          {cat}
        </button>
      ))}

      {/* Add Custom Category Button */}
      <button
        onClick={() => {
          const newCategory = prompt('Enter custom category:');
          if (newCategory && newCategory.trim()) {
            const trimmed = newCategory.trim().toLowerCase();
            if (!allCategories.includes(trimmed)) {
              onCustomCategoryAdd(trimmed);
            } else {
              onCategorySelect(trimmed);
            }
          }
        }}
        className="px-4 py-2 bg-transparent text-prowess-grey border border-prowess-grey/30 text-sm flex-shrink-0 transition-all hover:border-prowess-grey/50"
      >
        +
      </button>
    </div>
  );
};

export default CategoryChipSelector;
