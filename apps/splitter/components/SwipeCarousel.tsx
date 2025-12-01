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
 * Swipe carousel with smooth tab navigation.
 * 
 * Tab Navigation:
 * - Tabs slide smoothly left/right with content
 * - Active tab is highlighted (bright), others are muted
 * - Right gradient fade implies scrollability
 * - Infinite scroll: user can keep swiping, wraps around seamlessly
 * 
 * Content:
 * - All content panels exist in DOM for smooth transitions
 * - Swipe gesture controls which panel is visible
 */
const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ tabs, className = '' }) => {
  const { currentIndex, setCurrentIndex, bind, offset } = useSwipeGesture({
    totalItems: tabs.length,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate tab offset - tabs slide with content but stay more visible
  // Don't slide as aggressively so active tab stays in view
  const tabOffset = (() => {
    const tabWidth = 160; // Approximate width per tab including gap
    // Only slide partially - keep active tab visible near left
    const baseOffset = currentIndex * tabWidth * 0.6; // 60% slide factor
    // Add gesture offset for smooth dragging (scaled down for tabs)
    const gestureOffset = offset * 0.2;
    return -baseOffset + gestureOffset;
  })();

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab Navigation with gradient fade */}
      <div className="relative mb-4">
        {/* Tab container with overflow hidden */}
        <div className="overflow-hidden px-4">
          <div 
            className="flex gap-8 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(${tabOffset}px)`,
            }}
          >
            {tabs.map((tab, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="whitespace-nowrap flex-shrink-0 text-label text-xs transition-colors duration-200"
                  style={{
                    color: isActive ? '#D6CFBF' : 'rgba(154, 146, 135, 0.5)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Right gradient fade to imply scrollability */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent, black)',
          }}
        />
      </div>

      {/* Content Area - Swipeable */}
      <div
        ref={containerRef}
        {...bind()}
        className="overflow-hidden touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ 
            width: `${tabs.length * 100}%`,
            transform: `translateX(calc(-${currentIndex * (100 / tabs.length)}% + ${offset}px))`,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex-shrink-0"
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
