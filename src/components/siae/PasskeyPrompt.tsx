"use client";

interface PasskeyPromptProps {
  title?: string;
  description?: string;
  onContinue: () => void | Promise<void>;
  onLater?: () => void;
}

export function PasskeyPrompt({
  title = "Registra un passkey",
  description = "Tu próxima vez entrarás con tu huella o Face ID.",
  onContinue,
  onLater,
}: PasskeyPromptProps) {
  return (
    <div className="warning-banner" role="dialog" aria-modal="true" aria-labelledby="passkey-title">
      <h2 id="passkey-title" className="tipify-title text-2xl">
        🔑 {title}
      </h2>
      <p className="tipify-subtitle mb-4">{description}</p>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="primary-button" onClick={onContinue}>
          Registrar passkey
        </button>
        {onLater ? (
          <button type="button" className="secondary-button" onClick={onLater}>
            Más tarde
          </button>
        ) : null}
      </div>
    </div>
  );
}
