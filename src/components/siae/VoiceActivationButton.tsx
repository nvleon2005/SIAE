"use client";

import { useVoiceActivation } from "@/src/hooks/use-voice-activation";

interface VoiceActivationButtonProps {
  onEmergency: () => void;
}

export function VoiceActivationButton({ onEmergency }: VoiceActivationButtonProps) {
  const { status, startListening } = useVoiceActivation(onEmergency);
  const label = status === "listening" ? "Escuchando" : "Activar por voz";

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" className="secondary-button" onClick={startListening} aria-pressed={status === "listening"}>
        {label}
      </button>
      <p className="text-center text-xs text-slate-400" role={status === "error" || status === "unsupported" ? "alert" : "status"}>
        {status === "listening"
          ? "Di: Oye SIAE, emergencia"
          : status === "unsupported"
            ? "La activación por voz no está disponible en este navegador."
            : status === "error"
              ? "No se pudo usar el micrófono. Puedes activar la emergencia con el botón rojo."
              : "Activa la escucha para decir Oye SIAE, emergencia."}
      </p>
    </div>
  );
}