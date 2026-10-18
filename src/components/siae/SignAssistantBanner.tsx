"use client";

import React, { useEffect } from "react";
import type { SignDetectionResult } from "@/src/modules/ai/sign-assistant";

interface SignAssistantBannerProps {
  detectedSign: SignDetectionResult | null;
  onConfirm: () => void;
  onDismiss: () => void;
  className?: string;
}

export function SignAssistantBanner({
  detectedSign,
  onConfirm,
  onDismiss,
  className = "",
}: SignAssistantBannerProps) {
  useEffect(() => {
    if (!detectedSign) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detectedSign, onConfirm, onDismiss]);

  if (!detectedSign) return null;

  const percentage = Math.round(detectedSign.confidence * 100);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-emerald-400 bg-neutral-950 p-4 text-white shadow-2xl backdrop-blur-lg transition-all animate-in fade-in slide-in-from-top-2 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl border border-emerald-400/40" aria-hidden="true">
            🖐️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                IA MediaPipe Hands · {percentage}% Confianza
              </span>
            </div>
            <p className="text-base font-bold text-white">
              ¿Confirmas la seña: <span className="text-yellow-300">&ldquo;{detectedSign.label}&rdquo;</span>?
            </p>
            <p className="text-xs text-neutral-300">
              Presiona Espacio/Enter o toca el botón para notificar al operador de VEN 911.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white"
          >
            ✅ Confirmar y Enviar
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Descartar detección de seña"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-700 active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
