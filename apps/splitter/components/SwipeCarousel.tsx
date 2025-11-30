import { ReactNode, useRef } from 'react';
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
 * - Active tab is always shown first in the tab list
 * - All content panels exist in DOM, translated off-screen for smooth transitions
 * - Uses gesture detection for smooth mobile swiping
 */
const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ tabs, className = '' }) => {
  const { currentIndex, setCurrentIndex, bind, offset } = useSwipeGesture({
    totalItems: tabs.length,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reorder tabs so active one appears first in the navigation
  const reorderedTabs = [
    tabs[currentIndex],
    ...tabs.filter((_, idx) => idx !== currentIndex),
  ];

  // Get original indices for the reordered tabs
  const getOriginalIndex = (tab: Tab) => tabs.findIndex(t => t.id === tab.id);

  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${className}`}>
      {/* Tab Navigation - Active tab first */}
      <div className="tab-nav px-4 mb-2">
        {reorderedTabs.map((tab) => {
          const originalIdx = getOriginalIndex(tab);
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentIndex(originalIdx)}
              className={`tab-nav-item ${originalIdx === currentIndex ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area - All panels exist, translated horizontally */}
      <div
        ref={containerRef}
        {...bind()}
        className="flex-1 overflow-hidden touch-pan-y relative"
        style={{ touchAction: 'pan-y' }}
      >
        <div 
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{ 
            width: `${tabs.length * 100}%`,
            transform: `translateX(calc(-${currentIndex * (100 / tabs.length)}% + ${offset}px))`,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex-shrink-0 overflow-y-auto h-full"
              style={{ width: `${100 / tabs.length}%` }}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeCarousel;

