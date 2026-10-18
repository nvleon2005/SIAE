import React from "react";
import { Camera, Video, Mic, Send } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface EvidenceRequestModalProps {
  isOpen: boolean;
  selectedItem: DemandaItem;
  evidenceType: "foto" | "video" | "audio";
  setEvidenceType: (type: "foto" | "video" | "audio") => void;
  onClose: () => void;
  onRequestEvidence: (demandId: string, type: "foto" | "video" | "audio") => Promise<void>;
}

export function EvidenceRequestModal({
  isOpen,
  selectedItem,
  evidenceType,
  setEvidenceType,
  onClose,
  onRequestEvidence,
}: EvidenceRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 id="evidence-dialog-title" className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-sky-500" />
            Solicitar Evidencia al Alertante
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Cerrar modal de evidencia"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Se remitirá un requerimiento al smartphone del alertante en <strong>{selectedItem.id}</strong> para enriquecer el triaje prehospitalario sin interrumpir la llamada activa.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Tipo de evidencia requerida:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "foto", label: "Fotografía", desc: "Foto de escena", Icon: Camera },
              { id: "video", label: "Video corto", desc: "10 segundos", Icon: Video },
              { id: "audio", label: "Nota de voz", desc: "Audio ambiente", Icon: Mic },
            ].map((opt) => {
              const Icon = opt.Icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEvidenceType(opt.id as "foto" | "video" | "audio")}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    evidenceType === opt.id
                      ? "border-[#0f6cbd] bg-sky-50 dark:bg-sky-950/60 text-[#0f6cbd] dark:text-sky-200 ring-2 ring-[#0f6cbd]/30 font-bold"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={async () => {
              await onRequestEvidence(selectedItem.id, evidenceType);
              onClose();
            }}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Enviar Requerimiento
          </button>
        </div>
      </div>
    </div>
  );
}
