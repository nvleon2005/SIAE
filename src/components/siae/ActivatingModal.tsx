"use client";

interface ActivatingModalProps {
  secondsLeft: number;
  state: "activating" | "queued";
}

export function ActivatingModal({ secondsLeft, state }: ActivatingModalProps) {
  const isQueued = state === "queued";

  return (
    <div
      className="activating-modal"
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label={isQueued ? "Emergencia en cola" : "Activación de emergencia"}
    >
      <div className="activating-modal__spinner" aria-hidden="true" />
      <p className="activating-modal__title">{isQueued ? "EN COLA" : "ACTIVANDO..."}</p>
      <p className="activating-modal__timer">{secondsLeft.toString().padStart(2, "0")}</p>
      <p className="activating-modal__copy">
        {isQueued
          ? "Sigue conectado. Estamos esperando a un agente disponible."
          : "Sigue conectado. Estamos buscando un agente."}
      </p>
      {isQueued ? <p className="activating-modal__meta">Posición: 1</p> : null}
    </div>
  );
}
