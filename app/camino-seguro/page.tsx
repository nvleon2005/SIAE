"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AuthenticatedAppShell } from "@/src/components/siae/AuthenticatedAppShell";
import { MobileBottomNav } from "@/src/components/siae/MobileBottomNav";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";

export default function CaminoSeguroPage() {
  return (
    <AuthenticatedAppShell>
      <main
        id="main-camino-content"
        aria-label="Camino Seguro"
        className="min-h-screen w-full flex-1 bg-[var(--background)] p-4 pb-24 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:p-6"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <Link className="text-sm font-semibold text-[var(--accent)] hover:underline" href="/">
                ← Volver al inicio
              </Link>
              <h1 className="mt-3 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                <ShieldAlert className="h-7 w-7 text-amber-600" />
                Camino Seguro
              </h1>
            </div>
            <ThemeToggle showLabel={false} />
          </header>

          <section
            className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            role="alert"
          >
            <h2 className="flex items-center gap-2 text-base font-bold">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Acompañamiento no disponible
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Esta función no está conectada a un servicio del backend que pueda iniciar y cerrar una sesión
              de acompañamiento, ni validar un PIN de seguridad. No se está transmitiendo tu ubicación y no
              se notificará a contactos de emergencia desde esta pantalla.
            </p>
            <p className="mt-2 text-sm font-semibold">
              No uses esta pantalla como mecanismo de protección o seguimiento.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">¿Necesitas ayuda ahora?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Para solicitar asistencia, inicia el flujo de emergencia. La recepción depende de la
              disponibilidad del backend.
            </p>
            <Link
              href="/tipificar"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Ir a solicitar asistencia
            </Link>
          </section>
        </div>
        <MobileBottomNav />
      </main>
    </AuthenticatedAppShell>
  );
}
