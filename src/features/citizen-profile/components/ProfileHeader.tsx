import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { MultiProfileSelector } from "@/src/modules/profile/MultiProfileSelector";
import { ProfileTab } from "../types";

interface ProfileHeaderProps {
  activeTab: ProfileTab;
  mounted: boolean;
  isAuthenticated: boolean;
  syncing: boolean;
  onSync: () => void;
  onExport: () => void;
}

export function ProfileHeader({
  activeTab,
  mounted,
  isAuthenticated,
  syncing,
  onSync,
  onExport,
}: ProfileHeaderProps) {
  return (
    <div className="mb-4">
      {/* Breadcrumb & Titular Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
            <Link href="/" className="text-slate-700 dark:text-slate-300 font-medium hover:text-[var(--accent)] dark:hover:text-white transition inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Portal Ciudadano
            </Link>
            <span>/</span>
            <span className="text-[var(--accent)] dark:text-sky-400 font-bold">
              {activeTab === "medica"
                ? "Ficha Médica y Apoyos"
                : activeTab === "usuario"
                ? "Datos de la Cuenta"
                : activeTab === "domicilios"
                ? "Contactos y Domicilios"
                : "Accesibilidad de Pantalla"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--accent-hover)] dark:text-white leading-tight">
            Ficha Médica y Perfil de Asistencia
          </h1>
          <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            Información organizada para despacho prioritario por el Centro de Comando VEN 911 (Maturín, Edo. Monagas).
          </p>
        </div>

        {/* Acciones Rápidas del Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {mounted && isAuthenticated && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Sincronizado VEN 911</span>
              <button
                type="button"
                disabled={syncing}
                onClick={onSync}
                className="ml-1 text-[var(--accent)] dark:text-sky-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                title="Actualizar sincronización"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onExport}
            aria-label="Exportar mis datos"
            className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
          >
            <Download className="h-3 w-3 text-[var(--accent)] dark:text-sky-400" />
            <span>Exportar mis datos</span>
          </button>
        </div>
      </div>

      {/* Selector Multiusuario Local (RF-007) */}
      <div className="mb-4">
        <MultiProfileSelector />
      </div>
    </div>
  );
}
