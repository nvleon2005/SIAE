import React from "react";
import { KeyRound, ShieldAlert, X, Loader2 } from "lucide-react";

export interface KeyRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKeyId: string | null;
  keyRotatedAt: string | null;
  rotatingKeys: boolean;
  rotationResult: { success: boolean; message: string } | null;
  onRotateKey: () => void;
}

export function KeyRotationModal({
  isOpen,
  onClose,
  currentKeyId,
  keyRotatedAt,
  rotatingKeys,
  rotationResult,
  onRotateKey,
}: KeyRotationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="key-rotation-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 id="key-rotation-title" className="text-base font-bold text-slate-900 dark:text-white">
                Seguridad Criptográfica & Rotación JWT
              </h3>
              <p className="text-xs text-slate-500">Módulo exclusivo de soberanía del Administrador Global</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar modal de rotación de claves"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Identificador de Llave Activa (KID):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{currentKeyId ?? "No disponible"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Algoritmo de firma:</span>
              <span className="font-semibold text-slate-500">No disponible</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Última rotación registrada:</span>
              <span className="text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                {keyRotatedAt ? new Date(keyRotatedAt).toLocaleString("es-VE") : "No disponible"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 p-3 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              La rotación de claves requiere un servicio criptográfico del backend. Esta operación no está disponible y no se realizará desde el frontend.
            </p>
          </div>

          {rotationResult && (
            <div
              role="status"
              className={`rounded-xl p-3 text-xs font-semibold ${
                rotationResult.success
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {rotationResult.message}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onRotateKey}
            disabled={rotatingKeys}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition shadow-md"
          >
            {rotatingKeys ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rotando Claves...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Solicitar rotación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
