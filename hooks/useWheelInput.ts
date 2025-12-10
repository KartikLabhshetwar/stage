"use client";

import { useCallback, useRef, useEffect } from "react";

interface UseWheelInputOptions {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function useWheelInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: UseWheelInputOptions) {
  const ref = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -step : step;
      const multiplier = e.shiftKey ? 10 : e.ctrlKey || e.metaKey ? 0.1 : 1;
      const rawValue = value + delta * multiplier;
      const precision = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
      const newValue = Math.min(
        max,
        Math.max(min, parseFloat(rawValue.toFixed(precision))),
      );
      onChange(newValue);
    },
    [value, onChange, min, max, step],
  );

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener("wheel", handleWheel, { passive: false });
      return () => element.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  return { ref };
}
