import React from "react";
import { Activity, MapPin, User, Settings } from "lucide-react";
import { ProfileTab } from "../types";
import { LocalProfileRecord } from "@/src/lib/profile-db";

interface ProfileTabNavProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  profile: LocalProfileRecord;
}

export function ProfileTabNav({ activeTab, onTabChange, profile }: ProfileTabNavProps) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del perfil"
      className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
    >
      <button
        type="button"
        role="tab"
        id="tab-medica"
        aria-selected={activeTab === "medica"}
        aria-controls="panel-medica"
        onClick={() => onTabChange("medica")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
          activeTab === "medica"
            ? "bg-[var(--accent)] text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Activity className="h-3.5 w-3.5" />
        <span>Ficha Médica y Apoyos</span>
        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-200">
          {(profile.disabilities ?? []).length}
        </span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-domicilios"
        aria-label="Mis domicilios y datos"
        aria-selected={activeTab === "domicilios"}
        aria-controls="panel-domicilios"
        onClick={() => onTabChange("domicilios")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
          activeTab === "domicilios"
            ? "bg-[var(--accent)] text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <MapPin className="h-3.5 w-3.5" />
        <span>Contactos, Mis Domicilios y Datos</span>
        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {(profile.addresses ?? []).length}
        </span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-usuario"
        aria-selected={activeTab === "usuario"}
        aria-controls="panel-usuario"
        onClick={() => onTabChange("usuario")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
          activeTab === "usuario"
            ? "bg-[var(--accent)] text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <User className="h-3.5 w-3.5" />
        <span>Datos de la Cuenta</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-accesibilidad"
        aria-selected={activeTab === "accesibilidad"}
        aria-controls="panel-accesibilidad"
        onClick={() => onTabChange("accesibilidad")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
          activeTab === "accesibilidad"
            ? "bg-[var(--accent)] text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Settings className="h-3.5 w-3.5" />
        <span>Accesibilidad de Pantalla</span>
      </button>
    </div>
  );
}
