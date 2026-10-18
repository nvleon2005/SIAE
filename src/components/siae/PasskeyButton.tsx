"use client";

interface PasskeyButtonProps {
  onClick: () => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}

export function PasskeyButton({
  onClick,
  label = "Usar passkey",
  disabled = false,
}: PasskeyButtonProps) {
  return (
    <button
      type="button"
      className="primary-button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      🔑 {label}
    </button>
  );
}
