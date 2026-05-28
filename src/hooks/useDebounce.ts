"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";

export function useDebouncedCalculate(delay: number = 200) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const calculate = useSimulationStore((state) => state.calculate);

  const triggerCalculate = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      calculate();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return triggerCalculate;
}
