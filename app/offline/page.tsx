"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/src/components/siae/EmptyState";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { announce } from "@/src/lib/announce";

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckConnection = () => {
    triggerHapticFeedback("tap");
    setChecking(true);
    setStatusMessage(null);

    setTimeout(() => {
      setChecking(false);
      if (typeof navigator !== "undefined" && navigator.onLine) {
        setStatusMessage("¡Conexión restaurada! Ya puedes continuar con normalidad.");
        announce("Conexión restaurada");
        triggerHapticFeedback("success");
      } else {
        setStatusMessage("Aún continúas sin conexión. Si es una urgencia vital, usa la llamada al 911.");
        announce("Aún continúas sin conexión");
        triggerHapticFeedback("error");
      }
    }, 600);
  };

  return (
    <main className="tipify-page min-h-screen py-6 px-4" aria-live="polite">
      <div className="tipify-shell max-w-md mx-auto flex flex-col gap-6">
        <EmptyState
          icon="📡"
          title="Estás sin conexión a internet"
          description="Tu dispositivo no detecta datos móviles ni WiFi. El sistema guardará tus acciones en la cola local segura de tu teléfono."
          headingLevel="h1"
        />

        {statusMessage && (
          <div
            role="status"
            className="p-4 rounded-xl border border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)] text-sm font-medium text-center shadow-md animate-fade-in"
          >
            {statusMessage}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] text-center">
            Vías de auxilio inmediato (Red Telefónica)
          </h2>

          <a
            href="tel:911"
            className="primary-button flex items-center justify-center gap-3 w-full py-4 text-center font-bold text-base bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-transform active:scale-95"
            onClick={() => triggerHapticFeedback("sos")}
            aria-label="Llamar directamente al 911 por teléfono tradicional"
          >
            <span className="text-2xl" aria-hidden="true">📞</span>
            <span>Llamar al 911 (Voz)</span>
          </a>

          <a
            href="sms:911?body=EMERGENCIA%20SIAE%20MONAGAS%20SOLICITO%20AUXILIO"
            className="secondary-button flex items-center justify-center gap-3 w-full py-3.5 text-center font-semibold text-sm border-2 border-slate-700 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
            onClick={() => triggerHapticFeedback("tap")}
            aria-label="Enviar SMS de emergencia al 911"
          >
            <span className="text-xl" aria-hidden="true">✉️</span>
            <span>Enviar SMS de Emergencia</span>
          </a>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            className="chip-button w-full py-3 text-center justify-center font-medium min-h-[48px]"
            onClick={handleCheckConnection}
            disabled={checking}
          >
            {checking ? "Comprobando señal..." : "🔄 Comprobar conexión ahora"}
          </button>

          <Link
            href="/"
            className="text-button w-full text-center py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={() => triggerHapticFeedback("tap")}
          >
            ← Volver a la Home
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 text-xs text-[var(--muted)] leading-relaxed">
          <p className="font-semibold text-[var(--foreground)] mb-1">
            ℹ️ ¿Cómo funciona el modo fuera de línea?
          </p>
          <p>
            Tus alertas se resguardan de forma encriptada en la base de datos local de tu navegador (IndexedDB). En el instante en que tu dispositivo recupere señal celular o WiFi, el despachador de VEN 911 Maturín recibirá tu solicitud automáticamente sin que tengas que volver a escribirla.
          </p>
        </div>
      </div>
    </main>
  );
}
