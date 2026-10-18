"use client";

interface EmergencyStatusProps {
  state: "activating" | "queued";
  secondsLeft: number;
}

export function EmergencyStatus({ state, secondsLeft }: EmergencyStatusProps) {
  const isQueued = state === "queued";

  return (
    <div className="summary-card" role="status" aria-live="polite">
      <div className="summary-icon" aria-hidden="true">{isQueued ? "⏱️" : "⏳"}</div>
      <div>
        <p>{isQueued ? "En cola" : "Activando..."}</p>
        <small>{isQueued ? "Posición: 1" : `Quedan ${secondsLeft.toString().padStart(2, "0")}s`}</small>
      </div>
    </div>
  );
}
