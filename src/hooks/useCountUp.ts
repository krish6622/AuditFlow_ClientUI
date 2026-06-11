import { useEffect, useRef, useState } from "react";

/** Animates from 0 to `target` with an ease-out curve (count-up effect). */
export function useCountUp(target: number, duration = 1300): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(target * eased);
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setValue(target);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}
