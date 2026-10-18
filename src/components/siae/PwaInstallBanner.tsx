"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/modules/auth/auth-store";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { announce } from "@/src/lib/announce";
import { ShieldAlert, Download, X, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const user = useAuth((state) => state.user);
  const [currentPath, setCurrentPath] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installState, setInstallState] = useState({
    isStandalone: false,
    isIos: false,
    dismissed: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const { isStandalone, isIos, dismissed } = installState;

  useEffect(() => {
    // Comprobación asíncrona de modo standalone y preferencias guardadas
    const timer = setTimeout(() => {
      const isStandaloneMode =
        (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches) ||
        (typeof navigator !== "undefined" && "standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true);

      const dismissedAt = localStorage.getItem("siae_pwa_install_dismissed");
      let isDismissed = false;
      if (dismissedAt) {
        const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
          isDismissed = true;
        }
      }

      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua) && !isStandaloneMode;

      setInstallState({
        isStandalone: isStandaloneMode,
        isIos: isIosDevice,
        dismissed: isDismissed,
      });
    }, 0);

    // Captura evento de instalación de Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHapticFeedback("tap");

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        announce("Instalando SIAE VEN 911...");
        triggerHapticFeedback("success");
      }
      setDeferredPrompt(null);
      setInstallState((prev) => ({ ...prev, dismissed: true }));
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
      announce(showIosGuide ? "Guía cerrada" : "Sigue las instrucciones de instalación para iPhone");
    }
  };

  const handleDismiss = () => {
    triggerHapticFeedback("tap");
    localStorage.setItem("siae_pwa_install_dismissed", Date.now().toString());
    setInstallState((prev) => ({ ...prev, dismissed: true }));
  };

  // No mostrar banner de instalación en consolas de personal operativo (admin, operador, despachador)
  const isStaffRoute = currentPath.startsWith("/admin") || currentPath.startsWith("/dashboard") || currentPath.startsWith("/operador");
  const isStaffUser = user && user.role && user.role !== "solicitante";

  if (isStaffRoute || isStaffUser || isStandalone || dismissed || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <aside
      aria-label="Instalación de la aplicación de emergencias SIAE"
      role="region"
      className="pwa-install-banner fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-950/20 ring-1 ring-black/5 dark:ring-white/10 p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 mt-0.5"
            aria-hidden="true"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Instalar SIAE — VEN 911 Maturín
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
              Accede al botón SOS en 1 segundo directo desde tu pantalla de inicio, incluso sin cobertura de datos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar sugerencia de instalación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIosGuide && isIos && (
        <div className="mt-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/40 p-3 text-xs text-slate-700 dark:text-slate-300 animate-fade-in space-y-2">
          <p className="font-bold text-[var(--accent)] dark:text-sky-300 flex items-center gap-1.5">
            <Share className="w-3.5 h-3.5" />
            Cómo instalar en iPhone / iPad:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs">
            <li>
              Toca el botón <span className="font-bold text-slate-900 dark:text-white">Compartir</span> en la barra de Safari.
            </li>
            <li>
              Desplázate y pulsa <span className="font-bold text-slate-900 dark:text-white">&ldquo;Añadir a pantalla de inicio&rdquo;</span>.
            </li>
            <li>
              Pulsa <span className="font-bold text-slate-900 dark:text-white">&ldquo;Añadir&rdquo;</span> arriba a la derecha.
            </li>
          </ol>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3.5 text-xs font-bold flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[#113150] text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isIos ? (showIosGuide ? "Ocultar guía" : "Ver cómo instalar en iPhone") : "Instalar en mi teléfono"}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
        >
          Ahora no
        </button>
      </div>
    </aside>
  );
}
