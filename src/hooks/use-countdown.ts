"use client";

import { useEffect, useRef, useState } from "react";
import { announce } from "@/src/lib/announce";

interface UseCountdownOptions {
  enabled?: boolean;
  onComplete?: () => void;
  onTick?: (nextValue: number) => void;
  announceOnTicks?: number[];
  getAnnouncementMessage?: (value: number) => string;
}

export function useCountdown(initialSeconds: number, options: UseCountdownOptions = {}) {
  const {
    enabled = true,
    onComplete,
    onTick,
    announceOnTicks = [5, 3, 1],
    getAnnouncementMessage,
  } = options;

  const [seconds, setSeconds] = useState(initialSeconds);
  const completedRef = useRef(false);

  const reset = (nextSeconds: number) => {
    completedRef.current = false;
    setSeconds(nextSeconds);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (seconds <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timerId = window.setTimeout(() => {
      const nextValue = seconds - 1;
      setSeconds(nextValue);
      onTick?.(nextValue);

      if (announceOnTicks.includes(nextValue) && nextValue > 0) {
        const message = getAnnouncementMessage?.(nextValue) ?? `Quedan ${nextValue} segundos para enviar`;
        announce(message);
      }

      if (nextValue <= 0) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [announceOnTicks, enabled, getAnnouncementMessage, onComplete, onTick, seconds]);

  return { seconds, reset };
}
