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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  const bind = useDrag(
    ({ movement: [mx, my], active, first }) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate angle from center
      const angle = Math.atan2(my - centerY, mx - centerX);

      if (first) {
        lastAngle.current = angle;
        lastTime.current = Date.now();
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
          increment = 100; // Fast rotation
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

        lastAngle.current = angle;
        lastTime.current = now;
      }
    },
    {
      axis: undefined, // Allow both x and y
      pointer: { touch: true },
    }
  );

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
    const newValue = Math.min(max, value + 100);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 100);
    onChange(newValue);
  };

  const formatAmount = (amount: number): string => {
    return Math.round(amount).toLocaleString();
  };

  // Calculate responsive underline width based on amount string
  const amountString = `${currency}${formatAmount(value)}`;
  const underlineWidth = Math.max(80, amountString.length * 35); // ~35px per character, min 80px

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Rotating Dial Container - Scaled down to show only top half */}
      <div
        ref={containerRef}
        {...bind()}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          width: '400px',
          height: '400px',
          marginBottom: '-200px', // Pull it down so only top half is visible
          touchAction: 'none',
          willChange: 'transform',
          backgroundColor: '#1F1A17',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Ring Circles SVG Background */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionProperty: 'transform',
            padding: '10px', // 10px padding from outer edge
          }}
        >
          <img
            src={ringCircles}
            alt="Dial"
            className="w-full h-full object-contain opacity-40 select-none pointer-events-none"
          />
        </div>

        {/* Center Content - Positioned at the top of the circle (which is the visible part) */}
        <div className="relative z-10 flex flex-col items-center mb-32">
          <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest uppercase">AMOUNT</p>

          {/* Amount Display/Input */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleDecrement}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors p-2"
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
              onClick={handleIncrement}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors p-2"
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


