import React, { useState } from "react";
import { User, Phone, Lock, HelpCircle, CheckCircle2, Trash2 } from "lucide-react";
import { LocalProfileRecord } from "@/src/lib/profile-db";

interface ProfileUserTabProps {
  profile: LocalProfileRecord;
  user: any;
  onUpdateField: (
    field: keyof Pick<LocalProfileRecord, "name" | "phone" | "preferredLocale">,
    value: string
  ) => void;
  onDeleteAllData: () => void;
}

export function ProfileUserTab({
  profile,
  user,
  onUpdateField,
  onDeleteAllData,
}: ProfileUserTabProps) {
  const [showLsvInfo, setShowLsvInfo] = useState(false);

  return (
    <div
      role="tabpanel"
      id="panel-usuario"
      aria-labelledby="tab-usuario"
      className="space-y-5"
    >
      {/* ROW 1: Identidad del Ciudadano */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/70 text-[var(--accent)] dark:text-sky-400 font-bold shrink-0">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Identidad del Ciudadano</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Identificación oficial para reconocimiento ante autoridades</p>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300">Art. 81 CRBV</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Nombre */}
          <div className="sm:col-span-1">
            <label htmlFor="profile-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombre y Apellidos</label>
            <input
              id="profile-name"
              type="text"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition"
              value={profile.name}
              onChange={(e) => onUpdateField("name", e.target.value)}
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* Teléfono — Read-only indicator */}
          <div className="sm:col-span-1">
            <label htmlFor="profile-phone" className="flex items-center justify-between gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--accent)] dark:text-sky-400" /> Teléfono de Contacto</span>
            </label>
            <div className="flex items-center gap-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3 py-2 opacity-80 cursor-not-allowed" title="El número telefónico está vinculado a tu cuenta para validación de seguridad.">
              <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex-1 truncate">{((user as any)?.telefono || (user as any)?.phone_number) || profile.phone || "No registrado"}</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-semibold">Fijo</span>
            </div>
          </div>

          {/* Comunicación Habitual con tooltip LSV */}
          <div className="sm:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="profile-comm" className="text-xs font-bold text-slate-700 dark:text-slate-300">Comunicación Habitual</label>
              <button
                type="button"
                onClick={() => setShowLsvInfo((v) => !v)}
                aria-label="¿Qué es LSV?"
                className="flex items-center gap-1 text-[var(--accent)] dark:text-sky-400 text-[10px] font-bold hover:underline cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                ¿Qué es LSV?
              </button>
            </div>
            {showLsvInfo && (
              <div role="status" className="mb-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 px-3 py-2 text-xs text-sky-900 dark:text-sky-200 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="font-bold block mb-0.5">🤟 Lengua de Señas Venezolana (LSV)</span>
                Selecciona esta opción si te comunicas principalmente por señas. El sistema VEN 911 asignará automáticamente un intérprete LSV o activará videollamada con la cámara.
              </div>
            )}
            <select
              id="profile-comm"
              value={profile.preferredLocale}
              onChange={(e) => onUpdateField("preferredLocale", e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition cursor-pointer"
            >
              <option value="es">Español (Voz)</option>
              <option value="es-lsv">Español / LSV (Señas)</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Estado de cuenta */}
          <div className="sm:col-span-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Estado de la cuenta:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verificada en VEN 911
            </span>
          </div>
        </div>
      </section>

      {/* ROW 2: Privacidad y Control */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacidad y Control de Datos Locales</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Conforme al derecho de autodeterminación informativa y normativas de protección de datos personales.</p>
          </div>
          <button
            type="button"
            onClick={onDeleteAllData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Borrar todos mis datos</span>
          </button>
        </div>
      </section>
    </div>
  );
}
