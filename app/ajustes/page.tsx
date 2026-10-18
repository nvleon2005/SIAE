"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutCurrentSession, useAuth } from "@/src/modules/auth/auth-store";
import { useProfile } from "@/src/modules/profile/profile-store";
import { defaultLocalProfile, type LocalProfileRecord, type ProfileTheme } from "@/src/lib/profile-db";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { Toast } from "@/src/components/siae/Toast";
import { useTranslation } from "@/src/modules/i18n/i18n-context";
import type { SupportedLocale } from "@/src/modules/i18n/types";
import { AuthenticatedAppShell } from "@/src/components/siae/AuthenticatedAppShell";
import {
  Settings,
  ArrowLeft,
  Sun,
  Moon,
  Type,
  Vibrate,
  Globe,
  LogOut,
  Sliders,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function AjustesPage() {
  const user = useAuth((state) => state.user);
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();

  const profile = useProfile((state) => state.profile) ?? defaultLocalProfile;
  const loadProfile = useProfile((state) => state.load);
  const updateProfile = useProfile((state) => state.update);

  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleUpdate = async (patch: Partial<LocalProfileRecord>, feedbackText?: string) => {
    await updateProfile(patch);
    triggerHapticFeedback("tap");
    if (feedbackText) {
      setToastMessage({
        title: "Ajuste guardado",
        message: feedbackText,
        type: "success",
      });
    }
  };

  const handleLogout = () => {
    triggerHapticFeedback("tap");
    logoutCurrentSession();
    router.push("/");
  };

  const handleTestVibration = () => {
    const success = triggerHapticFeedback("sos");
    if (success) {
      setToastMessage({
        title: "Vibración emitida",
        message: "Patrón SOS generado en el dispositivo.",
        type: "info",
      });
    } else {
      setToastMessage({
        title: "Hardware no disponible",
        message: "El dispositivo o navegador no soporta la API de vibración.",
        type: "info",
      });
    }
  };

  return (
    <AuthenticatedAppShell>
      <main id="main-ajustes-content" aria-label="Centro de Configuración y Accesibilidad" className="w-full flex-1 p-3 sm:p-4 lg:p-6 bg-[var(--background)] dark:bg-slate-950 min-h-screen transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* HEADER DEL DASHBOARD */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Link href="/" className="hover:text-[var(--accent)] dark:hover:text-white transition inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Portal Ciudadano
                </Link>
                <span>/</span>
                <span className="text-[var(--accent)] dark:text-sky-400 font-bold">Ajustes & Accesibilidad</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--accent-hover)] dark:text-white">
                Centro de Configuración y Accesibilidad
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Personaliza la presentación visual, contrastes, tiempos de respuesta y canales sensoriales.
              </p>
            </div>

            <span className="fluent-badge bg-sky-50 text-[var(--accent)] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 self-start md:self-auto">
              WCAG 2.2 AA Conforme
            </span>
          </div>

          {/* GRID MULTIPANEL DE AJUSTES EN 3 COLUMNAS BALANCEADAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {/* COLUMNA 1: PALETA Y LENGUAJE */}
            <div className="space-y-5">
              {/* PALETA DE CONTRASTE */}
              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/70 text-[var(--accent)] dark:text-sky-400 font-bold shrink-0">
                    <Sun className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Paleta de Color y Contraste
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Adaptada para condiciones lumínicas extremas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "light" as ProfileTheme, label: "Claro", bg: "bg-white text-slate-900 border-slate-300" },
                    { id: "dark" as ProfileTheme, label: "Oscuro", bg: "bg-slate-950 text-slate-100 border-slate-700" },
                    { id: "high_contrast" as ProfileTheme, label: "Alto Contraste", bg: "bg-black text-white border-white" },
                    { id: "yellow_black" as ProfileTheme, label: "Baja Visión", bg: "bg-black text-yellow-300 border-yellow-300" },
                  ].map((themeOpt) => {
                    const isSelected = profile.theme === themeOpt.id;
                    return (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => handleUpdate({ theme: themeOpt.id }, `Tema cambiado a ${themeOpt.label}`)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all min-h-[58px] cursor-pointer ${themeOpt.bg} ${
                          isSelected ? "ring-2 ring-[var(--accent)] dark:ring-sky-400 ring-offset-2 scale-102 font-bold shadow-xs" : "opacity-75 hover:opacity-100"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xs font-bold">{themeOpt.label}</span>
                        {isSelected && (
                          <span className="text-xs mt-0.5 px-1.5 py-0.2 rounded-full font-bold bg-[var(--accent)] text-white">
                            ● Activo
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-bold shrink-0">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Idioma del Sistema
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lengua principal para etiquetas y síntesis
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "es" as SupportedLocale, label: "Español" },
                    { id: "lsv" as SupportedLocale, label: "LSV" },
                    { id: "en" as SupportedLocale, label: "English" },
                  ].map((lang) => {
                    const isSelected = locale === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setLocale(lang.id);
                          void handleUpdate({ preferredLocale: lang.id }, `Idioma cambiado a ${lang.label}`);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                          isSelected
                            ? "border-[var(--accent)] bg-sky-50 dark:bg-sky-950 text-[var(--accent)] dark:text-sky-300 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* COLUMNA 2: TIPOGRAFÍA Y SESIÓN */}
            <div className="space-y-4">
              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                    <Type className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Escala Tipográfica y Lectura Fácil
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ampliación proporcional con ajuste de línea
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <label htmlFor="font-scale-slider" className="text-slate-700 dark:text-slate-300 text-xs">
                        Tamaño de Fuente Global:
                      </label>
                      <span className="font-bold text-[var(--accent)] dark:text-sky-400 text-xs">
                        {profile.fontScale.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      id="font-scale-slider"
                      type="range"
                      min={0.9}
                      max={2.0}
                      step={0.1}
                      value={profile.fontScale}
                      onChange={(e) => handleUpdate({ fontScale: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1">
                      <span>0.9x</span>
                      <span>1.0x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Modo Fácil Lectura</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Interlineado amplio y párrafos sintéticos.</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Modo Fácil Lectura"
                        checked={profile.pictogramsOnly}
                        onChange={(e) => handleUpdate({ pictogramsOnly: e.target.checked })}
                        className="h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Reducción de Animaciones</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Minimiza transiciones y fatiga visual.</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Reducción de Animaciones"
                        checked={profile.reducedMotion}
                        onChange={(e) => handleUpdate({ reducedMotion: e.target.checked })}
                        className="h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SESIÓN DEL USUARIO EN COLUMNA 2 */}
              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Sesión de Usuario
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Activa
                  </span>
                </div>
                <p suppressHydrationWarning className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 truncate">
                  {user?.nombre_completo || profile.name || "Usuario"} ({user?.correo_electronico || "Cuenta Local"})
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 transition shadow-xs cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión Segura</span>
                </button>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 font-bold shrink-0">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pulsación del Botón de Emergencia (SOS)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tiempo de pulsación para evitar errores
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { seconds: 0 as const, label: "0s" },
                    { seconds: 1 as const, label: "1s" },
                    { seconds: 3 as const, label: "3s" },
                  ].map((opt) => {
                    const isSelected = (profile.longPressSeconds ?? 1) === opt.seconds;
                    return (
                      <button
                        key={opt.seconds}
                        type="button"
                        onClick={() => void handleUpdate({ longPressSeconds: opt.seconds })}
                        className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                          isSelected
                            ? "border-[var(--accent)] dark:border-cyan-500 bg-[var(--accent)]/5 dark:bg-cyan-500/10 text-[var(--accent)] dark:text-cyan-300 ring-2 ring-[var(--accent)]/20"
                            : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 shadow-xs">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 font-bold shrink-0">
                    <Vibrate className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Respuesta Táctil / Háptica
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Confirmación física SOS
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Emite patrones de vibración al activar la llamada de auxilio o pulsar teclas de alta criticidad.
                </p>

                <button
                  type="button"
                  onClick={handleTestVibration}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-xs cursor-pointer"
                >
                  <Vibrate className="h-3.5 w-3.5" />
                  <span>Probar Vibración Háptica SOS</span>
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>

      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </AuthenticatedAppShell>
  );
}
