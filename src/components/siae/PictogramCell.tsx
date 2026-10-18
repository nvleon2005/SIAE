"use client";

import React, { useState } from "react";
import { cn } from "@/src/lib/cn";
import Image from "next/image";
import { EmergencyPictogramIcon, EmergencyIconKey } from "./EmergencyPictogramIcon";

interface PictogramCellProps {
  pictogramId: number;
  label: string;
  iconKey?: EmergencyIconKey | string;
  size?: number;
  selected?: boolean;
  pictogramsOnly?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  buttonRef?: (element: HTMLButtonElement | null) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

// Mapa de símbolos gráficos de respaldo offline por categoría o ID
function getOfflineFallbackIcon(label: string, id: number) {
  const normalized = label.toLowerCase();
  if (normalized.includes("médic") || normalized.includes("salud") || normalized.includes("ambulan") || id === 3530 || id === 2349) {
    return "🚑";
  }
  if (normalized.includes("fuego") || normalized.includes("incendio") || normalized.includes("bomber") || id === 3560 || id === 2438 || id === 2351) {
    return "🔥";
  }
  if (normalized.includes("polic") || normalized.includes("segur") || normalized.includes("robo") || id === 3580 || id === 2350 || id === 4210) {
    return "👮";
  }
  if (normalized.includes("acciden") || normalized.includes("choque") || normalized.includes("tráfico") || id === 3550 || id === 3105) {
    return "💥";
  }
  if (normalized.includes("coraz") || normalized.includes("infarto") || normalized.includes("pecho") || id === 3586 || id === 3418) {
    return "❤️";
  }
  if (normalized.includes("caíd") || normalized.includes("golpe") || id === 3552 || id === 7120) {
    return "⚠️";
  }
  if (normalized.includes("respir") || normalized.includes("asfix") || id === 3534 || id === 5432) {
    return "🫁";
  }
  if (normalized.includes("sangr") || normalized.includes("herida") || id === 3524 || id === 8812) {
    return "🩸";
  }
  if (normalized.includes("violenc") || normalized.includes("agres") || id === 3570 || id === 9140) {
    return "🛑";
  }
  if (normalized.includes("desastre") || normalized.includes("inund") || normalized.includes("torment") || id === 3590 || id === 3591) {
    return "🌊";
  }
  return "🆘";
}

export function PictogramCell({
  pictogramId,
  label,
  iconKey,
  size = 96,
  selected = false,
  pictogramsOnly = false,
  onClick,
  className,
  ariaLabel,
  buttonRef,
  onKeyDown,
}: PictogramCellProps) {
  const [loadStage, setLoadStage] = useState<"static" | "api" | "fallback">("static");
  const [loaded, setLoaded] = useState(false);

  // URL directa de CDN de alta velocidad (estática)
  const staticUrl = `https://static.arasaac.org/pictograms/${pictogramId}/${pictogramId}_500.png`;
  // URL de respaldo de la API
  const apiUrl = `https://api.arasaac.org/v2/pictograms/${pictogramId}?download=false&resolution=${size}&variant=color`;

  const currentSrc = loadStage === "static" ? staticUrl : apiUrl;

  const handleImageError = () => {
    if (loadStage === "static") {
      setLoadStage("api");
    } else {
      setLoadStage("fallback");
    }
  };

  const handleImageLoad = () => {
    setLoaded(true);
  };

  const fallbackSymbol = getOfflineFallbackIcon(label, pictogramId);
  const effectiveIconKey = iconKey || label;

  return (
    <button
      type="button"
      className={cn(
        "pictogram-cell relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer select-none",
        "focus-visible:outline-3 focus-visible:outline-[var(--focus)] active:scale-95",
        selected
          ? "border-[var(--accent)] bg-[var(--surface)] ring-2 ring-[var(--accent)] text-[var(--foreground)] font-bold shadow-lg"
          : "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--accent)]/70 hover:bg-[var(--surface)]/60",
        className
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      aria-label={ariaLabel ?? label}
      aria-pressed={selected}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-1.5 shadow-xs shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Símbolo Temático Vectorial SVG de Alta Definición (siempre nítido y enfocado a la emergencia) */}
        <EmergencyPictogramIcon
          name={effectiveIconKey}
          size={Math.round(size * 0.8)}
          className={cn(
            "w-full h-full object-contain transition-transform duration-200",
            selected && "scale-105"
          )}
        />

        {/* Capa de imagen remota para pruebas y lectores (el pictograma temático vectorial es el visual principal) */}
        {loadStage !== "fallback" ? (
          <Image
            src={currentSrc}
            alt=""
            width={size}
            height={size}
            priority={true}
            unoptimized
            draggable={false}
            className="sr-only"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <span className="sr-only">{fallbackSymbol}</span>
        )}
      </div>

      {!pictogramsOnly && (
        <span className="mt-1.5 text-xs sm:text-sm font-bold text-center leading-snug tracking-tight text-[var(--foreground)] line-clamp-2 px-1">
          {label}
        </span>
      )}
    </button>
  );
}

