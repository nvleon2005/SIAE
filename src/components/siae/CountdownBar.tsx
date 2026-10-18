"use client";

interface CountdownBarProps {
  seconds: number;
  onCancel: () => void;
}

export function CountdownBar({ seconds, onCancel }: CountdownBarProps) {
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return (
    <div
      className="countdown-wrapper"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Tiempo restante para enviar la emergencia: ${formattedSeconds} segundos`}
    >
      <div className="countdown-bar" aria-labelledby="countdown-title">
        <span id="countdown-title">ENVIANDO EN</span>
        <span className="countdown-number" aria-live="polite" aria-atomic="true">
          {formattedSeconds}
        </span>
      </div>
      <button
        type="button"
        className="secondary-button"
        onClick={onCancel}
        aria-label="Cancelar envío de emergencia"
      >
        Cancelar
      </button>
    </div>
  );
}
