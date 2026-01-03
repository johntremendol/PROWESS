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
 * - Velocity-based acceleration for intuitive value changes
 * - Manual input via clicking the amount
 * - Granular control via +/- buttons
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

  // Tuning parameter for velocity-based acceleration
  // Higher value = more aggressive acceleration
  const ACCELERATION_FACTOR = 0.5;

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
        // Ensure minimal deltaTime to avoid division by zero or extreme spikes
        const safeDeltaTime = Math.max(deltaTime, 1);
        const angularVelocity = Math.abs(normalizedDelta) / safeDeltaTime;

        // Calculate increment based on velocity and acceleration factor
        // Base increment is 1
        // As velocity increases, increment grows exponentially based on ACCELERATION_FACTOR
        // Tuning: 
        // 1. Base multiplier scales the raw velocity up to usable numbers
        // 2. Power function gives the "feel" of acceleration
        const velocityMultiplier = 1 + Math.pow(angularVelocity * 1000 * ACCELERATION_FACTOR, 2);
        const increment = Math.max(1, Math.round(velocityMultiplier));

        // Update value based on rotation direction - FLIPPED: right = increase
        const direction = normalizedDelta > 0 ? -1 : 1;

        // Use functional state update or ref to avoid stale closure if direct update
        // But here we rely on parent passed 'value' which updates on re-render. 
        // For smooth drag, we might missframes if parent doesn't update fast enough.
        // using latestValueRef.current is safer for calculation base.
        const newValue = Math.max(min, Math.min(max, latestValueRef.current + increment * direction));

        if (newValue !== latestValueRef.current) {
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
      // Don't filter taps inside here, handle clicks on children separately
    }
  );

  // Inertia Effect
  useEffect(() => {
    if (!inertia) return;

    let { velocity, direction } = inertia;
    let animationFrameId: number;
    const decelerationRate = 0.92; // Friction: lower = stops faster
    const minVelocity = 0.0005; // Stop threshold

    const step = () => {
      if (velocity < minVelocity) {
        setInertia(null);
        return;
      }

      // Consistent acceleration logic for inertia
      const velocityMultiplier = 1 + Math.pow(velocity * 1000 * ACCELERATION_FACTOR, 2);
      const increment = Math.max(1, Math.round(velocityMultiplier));

      const change = increment * direction;
      const currentValue = latestValueRef.current;
      const newValue = Math.max(min, Math.min(max, currentValue + change));

      if (newValue !== currentValue) {
        onChange(newValue);
      }

      // Visual rotation during inertia
      setRotation(prev => prev + (velocity * 180 / Math.PI * direction * 5));

      velocity *= decelerationRate;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inertia, min, max, onChange]);

  const handleAmountClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid double firing on touch devices if mapped incorrectly
    // But allow focus
    e.stopPropagation();
    setIsEditing(true);
    // Immediate focus
    // We use a slight timeout to ensure the render cycle completes switching div to input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Optional: Select all text for quick overwrite
        inputRef.current.select();
      }
    }, 10);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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

  // Simple increment/decrement without hold logic
  const handleIncrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent drag from catching this
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDecrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const formatAmount = (amount: number): string => {
    return Math.round(amount).toLocaleString();
  };

  const amountString = `${currency}${formatAmount(value)}`;
  const underlineWidth = Math.max(80, amountString.length * 35);

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
          bottom: 'calc(min(100vw, 440px) / -2)',
          touchAction: 'none',
          willChange: 'transform',
          borderRadius: '50%',
          backgroundColor: '#1F1A17',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Ring Circles SVG Background */}
        <div
          className="absolute right-0 bottom-0 transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionProperty: 'transform',
            padding: '10px',
          }}
        >
          <img
            src={ringCircles}
            alt="Dial"
            className="w-full h-full object-contain opacity-40 select-none pointer-events-none"
          />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center" style={{ marginBottom: '220px' }}>
          <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest uppercase">AMOUNT</p>

          {/* Amount Display/Input */}
          <div className="flex items-center gap-8 mb-2">
            <button
              onClick={handleDecrement}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors p-2 select-none"
            // Remove touch handlers that were used for long press
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
                  className="text-display text-5xl text-prowess-beige bg-transparent outline-none text-center font-normal"
                  style={{ caretColor: '#D6CFBF', width: `${Math.max(120, editValue.length * 30)}px` }}
                />
              ) : (
                <div
                  onClick={handleAmountClick}
                  onTouchEnd={(e) => {
                    // Prevent ghost clicks if needed, but onClick usually suffices. 
                    // To ensure 1-tap on mobile without drag interference:
                    handleAmountClick(e);
                  }}
                  className="text-display text-5xl text-prowess-beige cursor-pointer text-center font-normal select-none"
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
              onClick={handleIncrement}
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







