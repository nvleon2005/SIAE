"use client";

import { useEffect, useRef } from "react";
import { AddressForm } from "@/src/components/siae/ProfileForms";
import { type AddressFormValues } from "@/src/modules/profile/profile-schemas";
import { MapPin, X, ShieldCheck, Navigation2 } from "lucide-react";

interface AddressDrawerProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  onClose: () => void;
}

export function AddressDrawer({
  open,
  mode,
  initialValues,
  onSubmit,
  onClose,
}: AddressDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end" role="dialog" aria-modal="true" aria-label={mode === "add" ? "Registrar domicilio" : "Editar domicilio"}>
      {/* Overlay oscuro con blur */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        style={{ transition: "opacity 200ms ease" }}
      />

      {/* Side Panel — estilo ejecutivo institucional */}
      <div
        ref={drawerRef}
        className="relative z-10 flex flex-col w-full max-w-3xl bg-white dark:bg-[#0f1a2e] shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Header Premium con gradiente SIAE */}
        <div className="relative overflow-hidden shrink-0">
          {/* Fondo con gradiente institucional */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#163f66] via-[#1e5a8a] to-[#0d3557] dark:from-[#0f2744] dark:via-[#0d1f3c] dark:to-[#090d16]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.2)_0%,_transparent_60%)]" />

          <div className="relative flex items-start justify-between px-6 py-5 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Icono institucional */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/25 shadow-lg backdrop-blur-sm">
                <Navigation2 className="h-6 w-6 text-white" />
              </div>

              <div className="min-w-0">
                {/* Badge VEN 911 */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 mb-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                    VEN 911 Monagas · Catastro de Auxilio
                  </span>
                </div>

                <h2 className="text-lg font-black text-white leading-tight">
                  {mode === "add" ? "Registrar Domicilio de Auxilio" : "Editar Domicilio y Referencias"}
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Municipio Maturín · Cuadrantes de Paz 1–40 · Despacho Inmediato
                </p>
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de domicilio"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition cursor-pointer mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de información contextual */}
          <div className="relative flex items-center gap-3 px-6 py-2.5 bg-white/10 border-t border-white/10">
            <MapPin className="h-3.5 w-3.5 text-sky-300 shrink-0" />
            <p className="text-[11px] text-white/70 leading-snug">
              {mode === "add"
                ? "Registra tu domicilio para que las unidades de respuesta VEN 911 puedan localizarte con precisión en una emergencia."
                : "Actualiza los datos de tu domicilio. El punto GPS y la referencia visual son críticos para el rescate."}
            </p>
          </div>
        </div>

        {/* Cuerpo del formulario — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-7">
            <AddressForm
              mapHeight={320}
              initialValues={
                initialValues
                  ? {
                      label: initialValues.label ?? "",
                      value: initialValues.value ?? "",
                      referencePoint: initialValues.referencePoint ?? "",
                      parroquia: initialValues.parroquia ?? "",
                      lat: initialValues.lat ?? 9.7457,
                      lng: initialValues.lng ?? -63.1832,
                      accuracy: initialValues.accuracy,
                    }
                  : undefined
              }
              onSubmit={(values) => {
                onSubmit(values);
                onClose();
              }}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}