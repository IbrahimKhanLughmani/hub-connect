import { useEffect, useRef, useState } from 'react';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';

type AnimatedCounterProps = Omit<ThemedTextProps, 'children'> & {
  value: number;
  duration?: number;
};

export function AnimatedCounter({ value, duration = 2000, ...rest }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>(undefined);

  useEffect(() => {
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(Math.round(value * progress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return <ThemedText {...rest}>{displayValue.toLocaleString()}</ThemedText>;
}
