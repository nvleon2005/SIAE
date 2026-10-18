import React from "react";
import Link from "next/link";
import { HeartPulse, Accessibility } from "lucide-react";
import { LocalProfileRecord } from "@/src/lib/profile-db";

export interface CitizenMedicalVitalCardProps {
  profile: LocalProfileRecord;
}

export function CitizenMedicalVitalCard({ profile }: CitizenMedicalVitalCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Card: Ficha Médica Vital */}
      <div className="fluent-card overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-rose-50/60 dark:bg-rose-950/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-300">
                <HeartPulse className="h-4.5 w-4.5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Ficha Médica Vital
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Datos clínicos de respuesta inmediata</p>
              </div>
            </div>
            <Link href="/perfil?tab=medica" className="text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
              Editar &rarr;
            </Link>
          </div>

          <div className="p-5 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Sangre</p>
              <span className="inline-flex items-center rounded-lg bg-rose-600 text-white px-3 py-1 font-black text-sm shadow-xs">
                {profile.medicalData?.tipoSangre || "---"}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Alergias Críticas</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.medicalData?.alergias?.length ? profile.medicalData.alergias.join(", ") : "Ninguna declarada"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Condiciones Médicas</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.medicalData?.condicionesMedicas?.length ? profile.medicalData.condicionesMedicas.join(", ") : "Ninguna registrada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Canales de Accesibilidad */}
      <div className="fluent-card overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-purple-50/60 dark:bg-purple-950/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-600 dark:text-purple-300">
                <Accessibility className="h-4.5 w-4.5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Apoyos y Accesibilidad
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configuración adaptada para asistencia</p>
              </div>
            </div>
            <Link href="/perfil?tab=accesibilidad" className="text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
              Ajustar &rarr;
            </Link>
          </div>

          <div className="p-5 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Condición Declarada</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.disabilities.length ? profile.disabilities.map((d) => (
                  <span key={d} className="inline-flex items-center rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200/80 dark:border-purple-800/60 px-2.5 py-1 text-xs font-bold text-purple-800 dark:text-purple-300">
                    {d === "deaf" ? "Sordera (LSV)" : d === "motor" ? "Movilidad Reducida" : d === "blind" ? "Ceguera" : d === "low_vision" ? "Baja Visión" : d === "cognitive" ? "Apoyo Cognitivo" : d}
                  </span>
                )) : <span className="text-xs text-slate-500 dark:text-slate-400">Estándar (sin discapacidad declarada)</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Canales Prioritarios</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.channels.map((c) => (
                  <span key={c} className="rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                    {c === "video" ? "LSV (Videollamada)" : c === "rtt" ? "RTT (Texto en Vivo)" : "Llamada Voz"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
