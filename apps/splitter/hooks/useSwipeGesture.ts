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
  offset: number; // Current drag offset in pixels for smooth following
}

/**
 * Custom hook for infinite swipe carousel functionality.
 * Uses @use-gesture/react for smooth drag detection.
 * Returns offset for smooth drag-following animation.
 */
export const useSwipeGesture = ({
  totalItems,
  threshold = 50,
  onIndexChange,
}: UseSwipeGestureOptions): UseSwipeGestureReturn => {
  const [currentIndex, setCurrentIndexState] = useState(0);
  const [offset, setOffset] = useState(0);

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
      if (active) {
        // While dragging, update offset for smooth following
        setOffset(mx);
      } else {
        // Gesture ended - snap to index
        setOffset(0);
        
        if (Math.abs(mx) > threshold) {
          if (dx > 0) {
            // Swiped right -> go to previous
            setCurrentIndex(currentIndex - 1);
          } else {
            // Swiped left -> go to next
            setCurrentIndex(currentIndex + 1);
          }
        }
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
    offset,
  };
};

export default useSwipeGesture;

