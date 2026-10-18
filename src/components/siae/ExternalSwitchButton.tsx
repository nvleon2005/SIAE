"use client";

import { useExternalSwitch } from "@/src/hooks/use-external-switch";

interface ExternalSwitchButtonProps {
  onEmergency: () => void;
}

export function ExternalSwitchButton({ onEmergency }: ExternalSwitchButtonProps) {
  const { status, connect } = useExternalSwitch(onEmergency);
  const label = status === "connected" ? "Switch conectado" : "Conectar switch";

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" className="secondary-button" onClick={() => void connect()} aria-pressed={status === "connected"}>
        {status === "connecting" ? "Conectando..." : label}
      </button>
      <p className="text-center text-xs text-slate-400" role={status === "error" || status === "unsupported" ? "alert" : "status"}>
        {status === "connected"
          ? "Pulsa el switch para activar una emergencia."
          : status === "unsupported"
            ? "WebHID no está disponible. Usa Space, voz o el botón rojo."
            : status === "error"
              ? "No se pudo conectar el switch. Puedes usar otro método de activación."
              : "Conecta un switch USB o Bluetooth compatible."}
      </p>
    </div>
  );
}