"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <main className="flex-1 min-h-screen w-full bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-start gap-3 border-b border-[var(--card-border)] pb-4">
          <Link
            href="/admin"
            className="rounded-lg border border-[var(--card-border)] p-2 text-slate-500 transition hover:bg-[var(--card-border)]/40 hover:text-slate-900 dark:hover:text-white"
            aria-label="Volver al panel de administración"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
              Reportes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consultas de gestión basadas en información oficial.
            </p>
          </div>
        </header>

        <section
          className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          <h2 className="font-bold">Generación de reportes no disponible</h2>
          <p className="mt-2 leading-relaxed">
            No hay una API de reportes conectada en este frontend. Se retiraron los informes y las cifras
            precargadas para evitar presentar datos de ejemplo como resultados oficiales.
          </p>
        </section>
      </div>
    </main>
  );
}
