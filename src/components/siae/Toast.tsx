"use client";

import React, { useEffect } from "react";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
  onClose: () => void;
}

export function Toast({
  type = "info",
  title,
  message,
  durationMs = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    // Disparar respuesta háptica según el tipo
    if (type === "success") triggerHapticFeedback("success");
    else if (type === "error") triggerHapticFeedback("error");
    else if (type === "warning") triggerHapticFeedback("warning");
    else triggerHapticFeedback("tap");

    if (durationMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [type, durationMs, onClose]);

  const isAlert = type === "error" || type === "warning";

  const colorStyles: Record<ToastType, { border: string; bg: string; iconBg: string; text: string }> = {
    info: {
      border: "border-sky-500/50",
      bg: "bg-slate-900/95",
      iconBg: "text-sky-400 bg-sky-950/60",
      text: "text-sky-200",
    },
    success: {
      border: "border-emerald-500/50",
      bg: "bg-slate-900/95",
      iconBg: "text-emerald-400 bg-emerald-950/60",
      text: "text-emerald-200",
    },
    warning: {
      border: "border-amber-500/50",
      bg: "bg-slate-900/95",
      iconBg: "text-amber-400 bg-amber-950/60",
      text: "text-amber-200",
    },
    error: {
      border: "border-rose-500/50",
      bg: "bg-slate-900/95",
      iconBg: "text-rose-400 bg-rose-950/60",
      text: "text-rose-200",
    },
  };

  const currentStyle = colorStyles[type];

  return (
    <div
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
      className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 max-w-sm p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${currentStyle.bg} ${currentStyle.border}`}
    >
      <div className={`p-2 rounded-lg ${currentStyle.iconBg}`} aria-hidden="true">
        {type === "success" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === "error" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {type === "warning" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {type === "info" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <div className="flex-1 pr-2">
        <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
        {message && <p className={`text-xs mt-0.5 leading-relaxed ${currentStyle.text}`}>{message}</p>}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
