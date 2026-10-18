import { ClipboardCheck, X } from "lucide-react";

export interface CloseExpedientModalProps {
  isOpen: boolean;
  demandId: string | null;
  onClose: () => void;
}

export function CloseExpedientModal({
  isOpen,
  demandId,
  onClose,
}: CloseExpedientModalProps) {
  if (!isOpen || !demandId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white shadow-2xl dark:border-amber-900/60 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h3
            id="close-modal-title"
            className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white"
          >
            <ClipboardCheck aria-hidden="true" className="h-5 w-5 text-amber-600" />
            Cierre de expediente no disponible
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Expediente {demandId}
          </p>
          <p role="status" className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            El cierre no está conectado al backend. El estado del expediente no
            se modificará desde esta pantalla.
          </p>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
