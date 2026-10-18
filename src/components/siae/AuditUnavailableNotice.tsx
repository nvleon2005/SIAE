"use client";

export function AuditUnavailableNotice({ className = "" }: { className?: string }) {
  return (
    <p
      role="status"
      className={`rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100 ${className}`}
    >
      La auditoría forense no está conectada a un servicio backend verificable.
      No se genera ni registra un sello legal o un acta criptográfica.
    </p>
  );
}
