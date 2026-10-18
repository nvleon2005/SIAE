import React from "react";
import Link from "next/link";
import { UserCheck, Smartphone, Settings } from "lucide-react";
import { LocalProfileRecord } from "@/src/lib/profile-db";

export interface CitizenHeroStageProps {
  profile: LocalProfileRecord;
  onOpenPwaModal: () => void;
}

export function CitizenHeroStage({ profile, onOpenPwaModal }: CitizenHeroStageProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/20 dark:border-sky-800/40 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-[#1e5a8a] to-[#0d3557] dark:from-[#0f2744] dark:via-[#0d1f3c] dark:to-[#090d16]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.15)_0%,_transparent_60%)]" />

      <div className="relative px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white/90 uppercase tracking-wide">
                <UserCheck className="h-3 w-3 text-emerald-300" />
                Perfil Ciudadano Verificado
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                VEN 911 Maturín &middot; En Línea 24/7
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Bienvenido, <span className="text-sky-200">{profile.name || "Ciudadano"}</span>
            </h2>
            <p className="mt-1.5 text-xs text-white/70 leading-relaxed max-w-xl">
              Tu perfil de ayuda está activo y sincronizado con el Centro de Comando VEN 911, Maturín, Edo. Monagas.
            </p>

            <div className="mt-3 flex flex-wrap gap-4">
              <div className="flex flex-col">
                <span className="text-base font-black text-white">&lt; 6 min</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Respuesta estimada</span>
              </div>
              <div className="w-px bg-white/15 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-base font-black text-emerald-300">{profile.addresses.length || "0"}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Domicilios registrados</span>
              </div>
              <div className="w-px bg-white/15 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-base font-black text-sky-300">{profile.emergencyContacts.length || "0"}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Contactos de emergencia</span>
              </div>
              <div className="w-px bg-white/15 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-base font-black text-amber-300">{profile.channels.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Canales activos</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 lg:items-end">
            <button
              type="button"
              onClick={onOpenPwaModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 px-4 py-2.5 text-xs font-bold transition-all w-full sm:w-auto backdrop-blur-sm cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5 text-sky-300" />
              <span>Vincular App Móvil</span>
            </button>
            <Link
              href="/perfil"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2.5 text-xs font-bold transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Gestionar mi Ficha</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
