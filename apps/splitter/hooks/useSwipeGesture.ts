import { useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

interface UseSwipeGestureOptions {
  totalItems: number;
  threshold?: number;
  onIndexChange?: (index: number) => void;
}

interface UseSwipeGestureReturn {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  bind: ReturnType<typeof useDrag>;
  direction: 'left' | 'right' | null;
}

/**
 * Custom hook for infinite swipe carousel functionality.
 * Uses @use-gesture/react for smooth drag detection.
 */
export const useSwipeGesture = ({
  totalItems,
  threshold = 50,
  onIndexChange,
}: UseSwipeGestureOptions): UseSwipeGestureReturn => {
  const [currentIndex, setCurrentIndexState] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const setCurrentIndex = useCallback((index: number) => {
    // Handle infinite loop wrapping
    let newIndex = index;
    if (index < 0) {
      newIndex = totalItems - 1;
    } else if (index >= totalItems) {
      newIndex = 0;
    }
    
    setCurrentIndexState(newIndex);
    onIndexChange?.(newIndex);
  }, [totalItems, onIndexChange]);

  const bind = useDrag(
    ({ movement: [mx], direction: [dx], active }) => {
      if (!active) {
        // Gesture ended
        if (Math.abs(mx) > threshold) {
          if (dx > 0) {
            // Swiped right -> go to previous
            setDirection('right');
            setCurrentIndex(currentIndex - 1);
          } else {
            // Swiped left -> go to next
            setDirection('left');
            setCurrentIndex(currentIndex + 1);
          }
        }
        // Reset direction after a short delay
        setTimeout(() => setDirection(null), 300);
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  );

  return {
    currentIndex,
    setCurrentIndex,
    bind,
    direction,
  };
};

export default useSwipeGesture;

