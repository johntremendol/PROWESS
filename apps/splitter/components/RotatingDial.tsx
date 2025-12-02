import { useState, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';

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
 * - ringcircles.svg as rotating background
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
    ({ movement: [mx, my], velocity: [vx, vy], active, first }) => {
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

        // Update value based on rotation direction
        const direction = normalizedDelta > 0 ? 1 : -1;
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

  return (
    <div className="flex flex-col items-center">
      {/* Rotating Dial Container */}
      <div
        ref={containerRef}
        {...bind()}
        className="relative w-80 h-80 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none', willChange: 'transform' }}
      >
        {/* Ring Circles SVG Background */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionProperty: 'transform',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 416.501 416.812"
            className="opacity-40"
          >
            <use href="/assets/ringcircles.svg#root" />
            {/* Fallback: inline the ring pattern */}
            <g transform="translate(0 -0.001)">
              <path d="M550.972,271.224v-.754h-4.523v.754Z" transform="translate(-134.471 -66.557)" fill="#676767"/>
              <path d="M550.972,278.224v-.754h-4.523v.754Z" transform="translate(-134.471 -68.279)" fill="#676767"/>
              <path d="M550.972,285.224v-.754h-4.523v.754Z" transform="translate(-134.471 -70.002)" fill="#676767"/>
              {/* Additional paths from ringcircles.svg would go here - truncated for brevity */}
            </g>
          </svg>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-label text-xs text-prowess-grey mb-4 tracking-widest">AMOUNT</p>
          
          {/* Amount Display/Input */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleDecrement}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors"
            >
              −
            </button>
            
            <div className="relative">
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
                  className="text-display text-5xl text-prowess-beige bg-transparent outline-none text-center w-48"
                  style={{ caretColor: '#D6CFBF' }}
                />
              ) : (
                <div
                  onClick={handleAmountClick}
                  className="text-display text-5xl text-prowess-beige cursor-pointer text-center min-w-48"
                >
                  {currency}{formatAmount(value)}
                </div>
              )}
              
              {/* Red Underline */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-prowess-red mt-2" />
            </div>
            
            <button
              onClick={handleIncrement}
              className="text-prowess-beige/60 hover:text-prowess-beige text-3xl transition-colors"
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

