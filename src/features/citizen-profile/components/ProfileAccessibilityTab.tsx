import React, { useState } from "react";
import Link from "next/link";
import { Sliders, HelpCircle, RotateCcw, ExternalLink } from "lucide-react";
import { LocalProfileRecord } from "@/src/lib/profile-db";

interface ProfileAccessibilityTabProps {
  profile: LocalProfileRecord;
  onUpdateField: (
    field: keyof Pick<LocalProfileRecord, "theme" | "preferredLocale" | "fontScale" | "pictogramsOnly" | "reducedMotion">,
    value: string | number | boolean
  ) => void;
  onResetAccessibility: () => void;
}

export function ProfileAccessibilityTab({
  profile,
  onUpdateField,
  onResetAccessibility,
}: ProfileAccessibilityTabProps) {
  const [showAlertasInfo, setShowAlertasInfo] = useState(false);

  return (
    <div
      role="tabpanel"
      id="panel-accesibilidad"
      aria-labelledby="tab-accesibilidad"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
    >
      {/* Columna Izquierda: Paleta e Idioma */}
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="h-5 w-5 text-[var(--accent)] dark:text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Presentación Visual e Idioma
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contraste cromático y escala tipográfica
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="profile-theme" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tema
              </label>
              <select
                id="profile-theme"
                value={profile.theme}
                onChange={(e) => onUpdateField("theme", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="high_contrast">Alto Contraste</option>
                <option value="yellow_black">Amarillo / Negro</option>
              </select>
            </div>

            <div>
              <label htmlFor="profile-language" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Idioma
              </label>
              <select
                id="profile-language"
                value={profile.preferredLocale}
                onChange={(e) => onUpdateField("preferredLocale", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <label htmlFor="font-slider">Tamaño de texto</label>
                <span className="font-mono text-sm font-black text-[var(--accent)] dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                  {profile.fontScale.toFixed(1)}x
                </span>
              </div>
              <input
                id="font-slider"
                aria-label="Tamaño de texto"
                type="range"
                min={0.9}
                max={2.0}
                step={0.1}
                value={profile.fontScale}
                onChange={(e) => onUpdateField("fontScale", Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Columna Derecha: Asistencia Sensorial y Restablecimiento */}
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Asistencia Sensorial y Movimiento
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Lectura Fácil (Easy Read)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Prioriza pictogramas y vocabulario directo
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.pictogramsOnly}
                onChange={(e) => onUpdateField("pictogramsOnly", e.target.checked)}
                className="h-5 w-5 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex-1 mr-4">
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="reduced-motion-input" className="text-sm font-bold text-slate-900 dark:text-white block cursor-pointer">
                    Movimiento reducido
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAlertasInfo((v) => !v)}
                    className="flex items-center gap-1 text-[var(--accent)] dark:text-sky-400 text-[10px] font-bold hover:underline cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Alertas visuales
                  </button>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Desactiva animaciones y transiciones complejas
                </span>
                {showAlertasInfo && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-200 mt-2 animate-in fade-in slide-in-from-top-2 duration-200 leading-relaxed">
                    <strong className="block mb-0.5">⚠️ Alertas visuales adaptativas</strong>
                    Si mantienes el movimiento reducido, las alertas se limitarán a notificaciones estáticas y vibración, omitiendo destellos de pantalla o animaciones intrusivas.
                  </div>
                )}
              </div>
              <input
                id="reduced-motion-input"
                aria-label="Movimiento reducido"
                type="checkbox"
                checked={profile.reducedMotion}
                onChange={(e) => onUpdateField("reducedMotion", e.target.checked)}
                className="h-5 w-5 rounded accent-[var(--accent)] cursor-pointer shrink-0 mt-1 self-start"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onResetAccessibility}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restablecer accesibilidad</span>
              </button>

              <Link
                href="/ajustes"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline"
              >
                <span>Abrir Centro de Ajustes Completo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
