import { ReactNode } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface SwipeCarouselProps {
  tabs: Tab[];
  className?: string;
}

/**
 * Infinite swipe carousel with tab navigation.
 * Uses gesture detection for smooth mobile swiping.
 */
const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ tabs, className = '' }) => {
  const { currentIndex, setCurrentIndex, bind, direction } = useSwipeGesture({
    totalItems: tabs.length,
  });

  const currentTab = tabs[currentIndex];

  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${className}`}>
      {/* Tab Navigation */}
      <div className="tab-nav px-4 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setCurrentIndex(idx)}
            className={`tab-nav-item ${idx === currentIndex ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        {...bind()}
        className="flex-1 overflow-y-auto touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className={`
            transition-opacity duration-200
            ${direction ? 'opacity-0' : 'opacity-100'}
          `}
        >
          {currentTab.content}
        </div>
      </div>
    </div>
  );
};

export default SwipeCarousel;

