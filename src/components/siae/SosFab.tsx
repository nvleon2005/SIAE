"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { announce } from "@/src/lib/announce";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptic";
import { defaultLocalProfile, readProfileFromDb } from "@/src/lib/profile-db";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useRouter } from "next/navigation";
import { playAccessibilityChime } from "@/src/modules/a11y/audio-chimes";

const DEFAULT_LONG_PRESS_MS = 1000;
const ACTIVATION_NAVIGATION_DELAY_MS = 250;

export function SosFab() {
  const startActivation = useEmergency((state) => state.startActivation);
  const router = useRouter();
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const [longPressMs, setLongPressMs] = useState(DEFAULT_LONG_PRESS_MS);
  const timeoutRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    void readProfileFromDb().then((profile) => {
      const seconds = profile?.longPressSeconds;
      setLongPressMs(typeof seconds === "number" ? seconds * 1000 : DEFAULT_LONG_PRESS_MS);
    }).catch(() => {
      setLongPressMs(defaultLocalProfile.longPressSeconds * 1000);
    });
  }, []);

  const activateEmergency = useCallback(() => {
    if (isActivating) return;
    setIsPressing(false);
    setPressProgress(100);
    setIsActivating(true);
    startActivation();
    triggerHaptic([80, 60, 120]);
    playAccessibilityChime("sos_initiated");
    announce("Activando emergencia");
    navigationTimeoutRef.current = window.setTimeout(() => {
      router.push("/tipificar");
    }, ACTIVATION_NAVIGATION_DELAY_MS);
  }, [isActivating, router, startActivation]);

  useEffect(() => {
    const handleKeyShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        activateEmergency();
      }
    };

    window.addEventListener("keydown", handleKeyShortcut);
    return () => window.removeEventListener("keydown", handleKeyShortcut);
  }, [activateEmergency]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const cancelPress = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startTimeRef.current = null;
    setIsPressing(false);
    setPressProgress(0);
  };

  const handlePressStart = () => {
    if (isActivating) return;

    setIsPressing(true);
    triggerHaptic(25);
    if (longPressMs === 0) {
      activateEmergency();
      return;
    }

    startTimeRef.current = Date.now();
    const updateProgress = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / longPressMs) * 100, 100);
      setPressProgress(progress);

      if (elapsed < longPressMs) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        activateEmergency();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePressEnd = () => {
    if (isActivating) return;
    cancelPress();
  };

  const radius = 126;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pressProgress / 100) * circumference;

  return (
    <>
      <div className="relative inline-flex items-center justify-center">
        {isPressing && longPressMs > 0 && (
          <svg
            className="sos-progress-ring absolute pointer-events-none"
            style={{ width: 270, height: 270, transform: "rotate(-90deg)" }}
            viewBox="0 0 270 270"
            aria-hidden="true"
          >
            <circle
              cx="135"
              cy="135"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="10"
            />
            <circle
              cx="135"
              cy="135"
              r={radius}
              fill="transparent"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        <button
          type="button"
          className={cn(
            "sos-fab",
            !isActivating && !isPressing && "animate-pulse-emergency",
            isPressing && "is-pressing",
            isActivating && "is-activating"
          )}
          aria-label="Activar emergencia"
          aria-keyshortcuts="Alt+E"
          aria-busy={isActivating}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerLeave={handlePressEnd}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handlePressStart();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handlePressEnd();
            }
          }}
        >
          <span className="sos-icon">SOS</span>
          <span className="sos-text">EMERGENCIA</span>
          <span className="sos-hint">
            {isActivating
              ? "Activando..."
              : isPressing
              ? `${Math.round(pressProgress)}%`
              : longPressMs === 0
              ? "Toca para activar"
              : `Mantén ${longPressMs / 1000}s`}
          </span>
        </button>
      </div>

      {isActivating ? (
        <div className="activation-dialog" role="dialog" aria-live="assertive" aria-label="Activación de emergencia">
          <div className="activation-spinner" aria-hidden="true" />
          <p className="activation-title">ACTIVANDO...</p>
          <p className="activation-copy">Estamos buscando un agente. Sigue conectado.</p>
        </div>
      ) : null}
    </>
  );
}
