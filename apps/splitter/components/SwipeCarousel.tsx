import { ReactNode, useRef, useMemo } from 'react';
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
 * Enhanced Swipe carousel with continuous (infinite) flow.
 * Handles the "cut off" issue by rendering clones and wrapping indices.
 */
const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ tabs, className = '' }) => {
  const { currentIndex, setCurrentIndex, bind, offset } = useSwipeGesture({
    totalItems: tabs.length,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Header animation logic
  const headerTransform = useMemo(() => {
    // If we have 2 tabs, we want to slide between them
    // At index 0, SIGN UP is highlighted.
    // At index 1, LOGIN is highlighted.
    // The offset allows smooth dragging.
    const baseOffset = currentIndex * 80; // 80px gap/slide
    const dragOffset = offset * 0.3; // Dampened drag
    return -baseOffset + dragOffset;
  }, [currentIndex, offset]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className="relative mb-2 px-6">
        <div className="overflow-visible">
          <div
            className="flex gap-10 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              transform: `translateX(${headerTransform}px)`,
            }}
          >
            {/* If we want "continuous flow", we render the tabs set twice to allow wrapping */}
            {[...tabs, ...tabs].map((tab, idx) => {
              const actualIdx = idx % tabs.length;
              const isActive = actualIdx === currentIndex;
              return (
                <button
                  key={`${tab.id}-${idx}`}
                  onClick={() => setCurrentIndex(actualIdx)}
                  className="whitespace-nowrap flex-shrink-0 text-label text-xs transition-all duration-300 tracking-[0.2em]"
                  style={{
                    color: isActive ? '#D6CFBF' : 'rgba(154, 146, 135, 0.3)',
                    opacity: isActive ? 1 : 0.5,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Swipeable */}
      <div
        ref={containerRef}
        {...bind()}
        className="overflow-hidden touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className="flex transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
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
