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
 * Swipe carousel with smooth tab navigation.
 */
const SwipeCarousel: React.FC<SwipeCarouselProps> = ({ tabs, className = '' }) => {
  const { currentIndex, setCurrentIndex, bind, offset } = useSwipeGesture({
    totalItems: tabs.length,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Header animation logic - simple slide for 2 tabs
  const headerTransform = useMemo(() => {
    const baseOffset = currentIndex * 100; // Slide amount
    const dragOffset = offset * 0.2; // Dampened drag feedback
    return -baseOffset + dragOffset;
  }, [currentIndex, offset]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className="relative mb-6 px-6">
        <div className="overflow-visible">
          <div
            className="flex gap-12 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${headerTransform}px)`,
            }}
          >
            {tabs.map((tab, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="whitespace-nowrap flex-shrink-0 text-label text-xs transition-all duration-200 tracking-[0.2em]"
                  style={{
                    color: isActive ? '#D6CFBF' : 'rgba(214, 207, 191, 0.3)',
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
