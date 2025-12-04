import { useState, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import ringCircles from '../../../src/assets/ringcirlces.svg';

interface RotatingDialProps {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  min?: number;
  max?: number;
}

/**
 * RotatingDial Component
 * 
 * Interactive circular dial for amount input with:
 * - Drag around edges to rotate
 * - Velocity-based increments (slow: 1, medium: 10, fast: 100)
 * - Manual input via clicking the amount
 * - ringcirlces.svg as rotating background
 */
const RotatingDial: React.FC<RotatingDialProps> = ({
  value,
  onChange,
  currency,
  min = 0,
  max = 1000000,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const lastAngle = useRef(0);
  const lastTime = useRef(Date.now());
  const inertiaRef = useRef<{ velocity: number; direction: number } | null>(null);
  const [inertia, setInertia] = useState<{ velocity: number; direction: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  const bind = useDrag(
    ({ movement: [mx, my], active, first, last }) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate angle from center
      const angle = Math.atan2(my - centerY, mx - centerX);

      if (first) {
        lastAngle.current = angle;
        lastTime.current = Date.now();
        setInertia(null); // Clear any ongoing inertia
        inertiaRef.current = null; // Clear inertia ref
        return;
      }

      if (active) {
        const deltaAngle = angle - lastAngle.current;
        const now = Date.now();
        const deltaTime = now - lastTime.current;

        // Normalize deltaAngle to [-PI, PI]
        let normalizedDelta = deltaAngle;
        if (normalizedDelta > Math.PI) normalizedDelta -= 2 * Math.PI;
        if (normalizedDelta < -Math.PI) normalizedDelta += 2 * Math.PI;

        // Calculate velocity (radians per ms)
        const angularVelocity = Math.abs(normalizedDelta) / Math.max(deltaTime, 1);

        // Determine increment based on velocity
        let increment = 1;
        if (angularVelocity > 0.02) {
          increment = 20; // Fast rotation
        } else if (angularVelocity > 0.005) {
          increment = 10; // Medium rotation
        }

        // Update value based on rotation direction - FLIPPED: right = increase
        const direction = normalizedDelta > 0 ? -1 : 1;
        const newValue = Math.max(min, Math.min(max, value + increment * direction));

        if (newValue !== value) {
          onChange(newValue);
        }

        // Update rotation for visual feedback
        setRotation(prev => prev + (normalizedDelta * 180 / Math.PI));

        inertiaRef.current = { velocity: angularVelocity, direction };
        lastAngle.current = angle;
        lastTime.current = now;
      }

      if (last && inertiaRef.current) {
        setInertia(inertiaRef.current);
      }
    },
    {
      axis: undefined, // Allow both x and y
      pointer: { touch: true },
    }
  );

  // Inertia Effect
  useEffect(() => {
    if (!inertia) return;

    let { velocity, direction } = inertia;
    let animationFrameId: number;
    const decelerationRate = 0.95; // How fast the velocity decreases per frame
    const minVelocity = 0.001; // Stop when velocity is very low

    const step = () => {
      if (velocity < minVelocity) {
        setInertia(null); // Stop inertia
        return;
      }

      let increment = 1;
      if (velocity > 0.02) {
        increment = 20;
      } else if (velocity > 0.005) {
        increment = 10;
      }

      // Calculate change based on current velocity and direction
      const change = increment * direction;
      const currentValue = latestValueRef.current;
      const newValue = Math.max(min, Math.min(max, currentValue + change));

      if (newValue !== currentValue) {
        onChange(newValue);
      }

      // Update rotation for visual feedback during inertia
      // Arbitrary scaling for visual effect
      setRotation(prev => prev + (velocity * 180 / Math.PI * direction * 5));

      velocity *= decelerationRate; // Decelerate

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inertia, min, max, onChange]); // Include min, max, onChange as they are stable props/functions

  const handleAmountClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(val)) {
      setEditValue(val);
    }
  };

  const handleAmountBlur = () => {
    const numValue = parseFloat(editValue) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue);
    setIsEditing(false);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  // Interval ref for long press
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startIncrement = () => {
    handleIncrement(); // Trigger once immediately
    intervalRef.current = setInterval(handleIncrement, 100); // Repeat every 100ms
  };

  const startDecrement = () => {
    handleDecrement(); // Trigger once immediately
    intervalRef.current = setInterval(handleDecrement, 100); // Repeat every 100ms
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopInterval();
  }, []);

  const formatAmount = (amount: number): string => {
    return Math.round(amount).toLocaleString();
  };

  // Calculate responsive underline width based on amount string
  const amountString = `${currency}${formatAmount(value)}`;
  const underlineWidth = Math.max(80, amountString.length * 35); // ~35px per character, min 80px

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Rotating Dial Container */}
      <div
        ref={containerRef}
        {...bind()}
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        style={{
          width: 'min(100vw, 440px)',
          height: 'min(100vw, 440px)',
          bottom: 'calc(min(100vw, 440px) / -2)', // Position center at bottom of container
          touchAction: 'none',
          willChange: 'transform',
          borderRadius: '50%',
          backgroundColor: '#1F1A17', // Warm dark background to cover content behind
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', // Shadow to separate from content
        }}
      >
        {/* Ring Circles SVG Background */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionProperty: 'transform',
            padding: '10px', // Half of previous 20px
          }}
        >
          <img
            src={ringCircles}
            alt="Dial"
            className="w-full h-full object-contain opacity-40 select-none pointer-events-none"
          />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center" style={{ marginBottom: '276px' }}>
          <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest uppercase">AMOUNT</p>

          {/* Amount Display/Input */}
          <div className="flex items-center gap-12 mb-2">
            <button
              onMouseDown={startDecrement}
              onMouseUp={stopInterval}
              onMouseLeave={stopInterval}
              onTouchStart={startDecrement}
              onTouchEnd={stopInterval}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors p-2 select-none"
            >
              −
            </button>

            <div className="relative flex flex-col items-center">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAmountBlur();
                    }
                  }}
                  className="text-display text-6xl text-prowess-beige bg-transparent outline-none text-center font-normal"
                  style={{ caretColor: '#D6CFBF' }}
                />
              ) : (
                <div
                  onClick={handleAmountClick}
                  className="text-display text-6xl text-prowess-beige cursor-pointer text-center font-normal"
                >
                  {currency}{formatAmount(value)}
                </div>
              )}

              {/* Responsive Red Underline */}
              <div
                className="h-0.5 bg-prowess-red mt-2"
                style={{ width: `${underlineWidth}px` }}
              />
            </div>

            <button
              onMouseDown={startIncrement}
              onMouseUp={stopInterval}
              onMouseLeave={stopInterval}
              onTouchStart={startIncrement}
              onTouchEnd={stopInterval}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors p-2 select-none"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingDial;


