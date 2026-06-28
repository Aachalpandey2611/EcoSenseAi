import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  direction = 'up',
  className = '',
  decimals = 0,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(direction === 'down' ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = direction === 'down' ? value : 0;
    const end = value;
    const duration = 1500; // 1.5s
    
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      
      setCurrentValue(start + (end - start) * eased);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, direction]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(currentValue)}
      {suffix}
    </span>
  );
}
