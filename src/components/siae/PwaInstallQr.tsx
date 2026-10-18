"use client";

import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Smartphone, Copy, Check, ExternalLink, ShieldCheck, X } from "lucide-react";
import { type LocalProfileRecord } from "@/src/lib/profile-db";

interface PwaInstallQrProps {
  url?: string;
  className?: string;
  profile?: LocalProfileRecord;
  onClose?: () => void;
}

export function PwaInstallQr({ url, className = "", profile, onClose }: PwaInstallQrProps) {
  const [copied, setCopied] = useState(false);

  const isProfileCustomized = Boolean(
    profile &&
    (!profile.isAnonymous ||
      profile.name ||
      (profile.disabilities && profile.disabilities.length > 0) ||
      (profile.emergencyContacts && profile.emergencyContacts.length > 0))
  );

  const resolvedUrl = useMemo(() => {
    const base = url || (typeof window !== "undefined" ? window.location.origin : "https://siae.emergencias.gob");
    if (!profile || !isProfileCustomized) {
      return base;
    }

    try {
      const snapshot = {
        name: profile.name,
        disabilities: profile.disabilities,
        channels: profile.channels,
        preferredSignLanguage: profile.preferredSignLanguage,
        theme: profile.theme,
        fontScale: profile.fontScale,
        reducedMotion: profile.reducedMotion,
        pictogramsOnly: profile.pictogramsOnly,
        longPressSeconds: profile.longPressSeconds,
        emergencyContacts: profile.emergencyContacts,
        medicalNotes: profile.medicalNotes,
        medicalData: profile.medicalData,
        addresses: profile.addresses,
      };
      return `${base}/?sync_profile=${encodeURIComponent(JSON.stringify(snapshot))}`;
    } catch {
      return base;
    }
  }, [url, profile, isProfileCustomized]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(resolvedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignorar fallos de clipboard
    }
  };

  return (
    <div
      className={`rounded-3xl border border-sky-900/40 bg-gradient-to-b from-[#102a43] to-[#0b1d30] p-6 text-white shadow-xl ${className}`}
      role="region"
      aria-label="Descarga e instalación de la PWA en móvil"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
            <Smartphone className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Instala SIAE en tu teléfono móvil</h3>
            <p className="text-xs text-sky-200/80 mt-0.5">Acceso SOS directo en pantalla con geolocalización continua</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de instalación"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isProfileCustomized && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>QR con ficha de accesibilidad vinculada: {profile?.name || "Personalizada"}</span>
        </div>
      )}

      <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-white p-4 shadow-inner">
        {/* SVG QR Code Pattern accesible */}
        <div
          className="bg-white p-2 rounded-lg"
          role="img"
          aria-label={`Código QR para abrir la app SIAE en ${resolvedUrl}`}
        >
          <QRCode
            value={resolvedUrl}
            size={160}
            className="h-40 w-40"
            level="H"
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        <p className="mt-2 text-center text-xs font-semibold text-slate-700">
          Escanea con la cámara de tu teléfono móvil
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-300">
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/30 text-xs font-bold text-sky-200">1</span>
          <span>Abre la cámara de tu smartphone y enfoca el código QR.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/30 text-xs font-bold text-sky-200">2</span>
          <span>Pulsa el aviso para abrir la aplicación SIAE en el navegador.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/30 text-xs font-bold text-sky-200">3</span>
          <span>Selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong> o <strong>&quot;Instalar app&quot;</strong>.</span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-950/60 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-900/60 active:scale-95"
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              <span>¡Enlace copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>Copiar enlace directo</span>
            </>
          )}
        </button>

        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
          title="Abrir en pestaña nueva"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Abrir en nueva pestaña</span>
        </a>
      </div>
    </div>
  );
}

export function PwaInstallQrCompact({ url, profile }: PwaInstallQrProps) {
  const isProfileCustomized = Boolean(
    profile &&
    (!profile.isAnonymous ||
      profile.name ||
      (profile.disabilities && profile.disabilities.length > 0))
  );

  const resolvedUrl = useMemo(() => {
    const base = url || (typeof window !== "undefined" ? window.location.origin : "https://siae.emergencias.gob");
    if (!profile || !isProfileCustomized) return base;
    try {
      const snapshot = { name: profile.name, disabilities: profile.disabilities, channels: profile.channels };
      return `${base}/?sync_profile=${encodeURIComponent(JSON.stringify(snapshot))}`;
    } catch { return base; }
  }, [url, profile, isProfileCustomized]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <QRCode
        value={resolvedUrl}
        size={108}
        level="M"
        bgColor="#ffffff"
        fgColor="#0f172a"
        aria-label="Codigo QR para instalar SIAE"
      />
      {isProfileCustomized && profile?.name && (
        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 text-center">
          Ficha vinculada: {profile.name}
        </span>
      )}
    </div>
  );
}