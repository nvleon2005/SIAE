"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutCurrentSession, useAuth } from "@/src/modules/auth/auth-store";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import {
  Volume2,
  Keyboard,
  Monitor,
  Shield,
  LogOut,
  Bell,
  Headphones,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Zap,
} from "lucide-react";

export default function AdminAjustesPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);

  // Estados de configuración operativa
  const [alertChime, setAlertChime] = useState<"sirena" | "campana" | "suave">("sirena");
  const [volume, setVolume] = useState<number>(85);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [audioDevice, setAudioDevice] = useState<"diadema" | "altavoz">("diadema");
  const [rttSound, setRttSound] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleTestSound = () => {
    setIsPlayingTest(true);
    if (typeof window !== "undefined") {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = alertChime === "sirena" ? "sawtooth" : alertChime === "campana" ? "sine" : "triangle";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(volume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch {
        // Fallback silencioso
      }
    }
    setTimeout(() => setIsPlayingTest(false), 500);
  };

  const handleLogout = () => {
    logoutCurrentSession();
    router.push("/admin/login");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Puesto de Control VEN 911
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Ajustes de la Estación de Trabajo Operativa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configuración de timbres sonoros, atajos de teclado, periféricos y visualización para funcionarios de guardia.
            </p>
          </div>

          {savedNotice && (
            <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-xs animate-fadeIn">
              <CheckCircle2 className="h-4 w-4" />
              {savedNotice}
            </span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Audio y Alertas Sonoras de Emergencia */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Volume2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Audio & Timbre de Llamadas 911
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Alertas acústicas críticas para llamadas entrantes P0 / P1
                </p>
              </div>
            </div>

            {/* Selector de Tono */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Tono de Alerta Entrante (Prioridad P0/P1)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sirena", label: "Sirena VEN 911", Icon: AlertTriangle },
                  { id: "campana", label: "Campana Guardia", Icon: Bell },
                  { id: "suave", label: "Tono Moderado", Icon: Volume2 },
                ].map((t) => {
                  const Icon = t.Icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setAlertChime(t.id as "sirena" | "campana" | "suave");
                        showSaved(`Tono cambiado a: ${t.label}`);
                      }}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        alertChime === t.id
                          ? "border-[#0f6cbd] bg-sky-50 dark:bg-sky-950/60 text-[#0f6cbd] dark:text-cyan-300 shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nivel de Volumen y Botón de Prueba */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Volumen del Timbre ({volume}%)</span>
                <button
                  type="button"
                  onClick={handleTestSound}
                  disabled={isPlayingTest}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Bell className={`h-3.5 w-3.5 ${isPlayingTest ? "animate-bounce" : ""}`} />
                  {isPlayingTest ? "Sonando..." : "Probar Tono"}
                </button>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Dispositivo de Audio */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Dispositivo de Comunicación Activo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAudioDevice("diadema");
                    showSaved("Dispositivo: Auriculares / Diadema USB");
                  }}
                  className={`rounded-xl border p-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    audioDevice === "diadema"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600"
                  }`}
                >
                  <Headphones className="h-4 w-4" />
                  Diadema VoIP USB
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioDevice("altavoz");
                    showSaved("Dispositivo: Altavoces del Sistema");
                  }}
                  className={`rounded-xl border p-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    audioDevice === "altavoz"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600"
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  Altavoz Principal
                </button>
              </div>
            </div>

            {/* Checkbox RTT */}
            <label className="flex items-center gap-2 pt-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rttSound}
                onChange={(e) => {
                  setRttSound(e.target.checked);
                  showSaved(e.target.checked ? "Notificaciones RTT activadas" : "Notificaciones RTT silenciadas");
                }}
                className="rounded text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Emitir señal acústica suave con cada mensaje de chat RTT entrante
            </label>
          </div>

          {/* Card 2: Atajos de Teclado del Puesto de Mando */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Keyboard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Atajos de Teclado Operativos
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Control por hardware para triaje y despacho en segundos
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: "Espacio", desc: "Tomar / Asignar demanda seleccionada", icon: Zap },
                { key: "Tecla 1", desc: "Transferir de inmediato a Despacho CAD", icon: Radio },
                { key: "Tecla 2", desc: "Sumar Intérprete CINT LSV a la sala", icon: Headphones },
                { key: "Esc", desc: "Liberar demanda y devolver a la cola", icon: AlertTriangle },
                { key: "↑ / ↓", desc: "Navegar llamadas en la cola de triaje", icon: Keyboard },
              ].map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <s.icon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{s.desc}</span>
                  </div>
                  <kbd className="font-mono text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-800 dark:text-slate-200 shadow-2xs">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Visualización de Sala de Control */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Monitor className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Entorno Visual 24/7
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Modos de alto contraste y reducción de fatiga ocular para turnos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Tema de la Estación de Guardia
                </span>
                <span className="text-[11px] text-slate-500">Alternar modo claro u oscuro táctico</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Card 4: Funcionario y Puesto de Trabajo */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Puesto de Trabajo & Sesión
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Credenciales activas en la red segura VEN 911
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">Funcionario:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.nombre_completo || "No disponible"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">Rol Institucional:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  {user?.role === "operador" ? "Operador PSAP (Triaje)" : user?.role || "Operador"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">Estación Asignada:</span>
                <span className="font-bold text-slate-900 dark:text-white">No disponible</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-2 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión de Guardia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
