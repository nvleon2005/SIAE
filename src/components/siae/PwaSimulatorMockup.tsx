"use client";

import React from "react";
import { type LocalProfileRecord } from "@/src/lib/profile-db";
import {
  Wifi,
  Battery,
  Video,
  MessageSquare,
  Phone,
  MapPin,
  Accessibility,
  Sparkles,
} from "lucide-react";

interface PwaSimulatorMockupProps {
  profile: LocalProfileRecord;
  step: number;
}

export function PwaSimulatorMockup({ profile, step }: PwaSimulatorMockupProps) {
  const isHighContrast =
    profile.theme === "high_contrast" ||
    profile.disabilities.includes("low_vision") ||
    profile.disabilities.includes("elderly");

  const isDeaf =
    profile.disabilities.includes("deaf") ||
    profile.disabilities.includes("hard_of_hearing");

  const isBlind = profile.disabilities.includes("blind");
  const isMotor = profile.disabilities.includes("motor");
  const isCognitive = profile.disabilities.includes("cognitive");

  return (
    <div className="flex flex-col items-center justify-center p-2 lg:p-4">
      {/* Etiqueta superior explicativa */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold text-sky-200 shadow-sm backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        <span>Simulación en vivo de tu teléfono móvil</span>
      </div>

      {/* Chasis físico del Smartphone (iPhone / Android Flagship style) */}
      <div className="relative w-[310px] sm:w-[330px] rounded-[48px] border-[10px] border-slate-900 bg-slate-950 p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(14,165,233,0.15)] ring-1 ring-slate-800">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 h-5 w-24 rounded-full bg-slate-900 flex items-center justify-end px-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
        </div>

        {/* Pantalla interior de la PWA */}
        <div
          className={`relative h-[560px] w-full overflow-hidden rounded-[36px] flex flex-col justify-between transition-all duration-500 select-none ${
            isHighContrast
              ? "bg-black text-white border-2 border-yellow-400"
              : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
          }`}
        >
          {/* Barra de estado del sistema operativo móvil */}
          <div
            className={`pt-2.5 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight ${
              isHighContrast ? "text-yellow-300" : "text-slate-300"
            }`}
          >
            <span>09:11</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-wider font-bold">5G</span>
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>

          {/* Header de la PWA en el teléfono */}
          <div
            className={`mx-3 mt-2 rounded-2xl px-3.5 py-2.5 border flex items-center justify-between transition-colors ${
              isHighContrast
                ? "border-yellow-400 bg-black text-yellow-300"
                : "border-slate-800/80 bg-slate-900/90 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                  isHighContrast ? "bg-yellow-400 text-black" : "bg-red-600 text-white shadow-xs"
                }`}
              >
                S
              </div>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest leading-none text-sky-400">
                  VEN 911 MONAGAS
                </p>
                <p className="text-xs font-bold leading-tight truncate max-w-[130px]">
                  {profile.name || "Solicitante"}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                isHighContrast
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
              }`}
            >
              En línea
            </div>
          </div>

          {/* Banner dinámico de asistencia adaptada en pantalla */}
          <div className="px-3.5 py-1.5">
            {isHighContrast && (
              <div className="rounded-xl border-2 border-yellow-400 bg-black p-2 text-center text-yellow-300">
                <p className="text-[10px] font-extrabold uppercase tracking-wider">
                  ⚠️ MODO ALTO CONTRASTE ACTIVO
                </p>
                <p className="text-[11px] font-bold text-white">
                  Tipografía hiperlegible a 150%
                </p>
              </div>
            )}

            {isDeaf && !isHighContrast && (
              <div className="rounded-xl border border-sky-400/40 bg-sky-950/70 p-2 text-center text-sky-200">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center justify-center gap-1">
                  <Video className="h-3 w-3" /> Intérprete LSV de Guardia
                </p>
                <p className="text-[11px] text-slate-200">
                  Respuesta prioritaria por video y texto RTT
                </p>
              </div>
            )}

            {isMotor && !isHighContrast && (
              <div className="rounded-xl border border-purple-400/40 bg-purple-950/70 p-2 text-center text-purple-200">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center justify-center gap-1">
                  <Accessibility className="h-3 w-3" /> Pulsador Externo (Switch)
                </p>
                <p className="text-[11px] text-slate-200">
                  Botones táctiles ampliados a 88px
                </p>
              </div>
            )}

            {isBlind && !isHighContrast && (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/70 p-2 text-center text-emerald-200">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  🎙️ Activación por Voz Prioritaria
                </p>
                <p className="text-[11px] text-slate-200">
                  Diga &quot;Oye SIAE&quot; o toque la pantalla
                </p>
              </div>
            )}

            {isCognitive && !isHighContrast && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-950/70 p-2 text-center text-amber-200">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  🧩 Modo Lectura Fácil / ARASAAC
                </p>
                <p className="text-[11px] text-slate-200">
                  Pictogramas claros sin lenguaje técnico
                </p>
              </div>
            )}
          </div>

          {/* CENTRO: Botón SOS Dinámico en el Teléfono */}
          <div className="my-auto flex flex-col items-center justify-center py-2 px-4">
            <div className="relative flex items-center justify-center">
              {/* Anillo de pulso exterior */}
              <div
                className={`absolute h-40 w-40 rounded-full animate-ping opacity-20 pointer-events-none ${
                  isHighContrast ? "bg-yellow-400" : "bg-red-500"
                }`}
              />

              {/* Botón SOS */}
              <div
                className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full shadow-2xl transition-transform duration-300 ${
                  isHighContrast
                    ? "border-4 border-yellow-400 bg-black text-yellow-300"
                    : "border-4 border-red-400/40 bg-gradient-to-b from-red-600 via-red-700 to-red-900 text-white shadow-[0_0_35px_rgba(220,38,38,0.5)]"
                }`}
              >
                <span className="text-2xl font-black tracking-wider leading-none">
                  SOS
                </span>
                <span
                  className={`mt-1 text-[9px] font-bold uppercase tracking-widest ${
                    isHighContrast ? "text-white" : "text-red-200"
                  }`}
                >
                  {isHighContrast ? "ALTO CONTRASTE" : "EMERGENCIA"}
                </span>
              </div>
            </div>

            <p
              className={`mt-3 text-center text-[10px] font-semibold ${
                isHighContrast ? "text-yellow-300" : "text-slate-400"
              }`}
            >
              {isMotor
                ? "Toca o pulsa Switch externo"
                : isBlind
                ? "Presiona o di 'Auxilio'"
                : "Toca para activar auxilio inmediato"}
            </p>
          </div>

          {/* BANDEJA INFERIOR: Canales y Ubicación en el Celular */}
          <div
            className={`mx-3 mb-3 rounded-2xl p-2.5 border transition-colors ${
              isHighContrast
                ? "border-yellow-400 bg-black text-yellow-300"
                : "border-slate-800/80 bg-slate-900/90 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider text-slate-400">
              <span>Canales Configurados</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <MapPin className="h-3 w-3" />
                {profile.locationAllowed ? "GPS Activo" : "GPS Pendiente"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div
                className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-center border transition-all ${
                  profile.channels.includes("video") || isDeaf
                    ? isHighContrast
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold"
                      : "border-sky-500 bg-sky-950/80 text-sky-200 font-bold"
                    : "border-slate-800 bg-slate-950/40 text-slate-500 opacity-60"
                }`}
              >
                <Video className="h-3.5 w-3.5 mb-0.5" />
                <span className="text-[9px]">Video LSV</span>
              </div>

              <div
                className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-center border transition-all ${
                  profile.channels.includes("rtt") || isDeaf || isBlind
                    ? isHighContrast
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold"
                      : "border-sky-500 bg-sky-950/80 text-sky-200 font-bold"
                    : "border-slate-800 bg-slate-950/40 text-slate-500 opacity-60"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 mb-0.5" />
                <span className="text-[9px]">Texto RTT</span>
              </div>

              <div
                className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-center border transition-all ${
                  profile.channels.includes("voz") && !isDeaf
                    ? isHighContrast
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold"
                      : "border-sky-500 bg-sky-950/80 text-sky-200 font-bold"
                    : "border-slate-800 bg-slate-950/40 text-slate-500 opacity-60"
                }`}
              >
                <Phone className="h-3.5 w-3.5 mb-0.5" />
                <span className="text-[9px]">Voz 911</span>
              </div>
            </div>
          </div>

          {/* Barra inferior táctil del móvil */}
          <div className="mx-auto mb-2 h-1 w-28 rounded-full bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}
