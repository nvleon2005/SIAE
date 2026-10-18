import React from "react";
import { cn } from "@/src/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "pictogram";
  width?: string | number;
  height?: string | number;
  className?: string;
  ariaLabel?: string;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className,
  ariaLabel = "Cargando información...",
  style,
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "text":
        return "h-4 rounded-md w-full";
      case "circular":
        return "rounded-full shrink-0";
      case "pictogram":
        return "w-28 h-32 rounded-2xl";
      case "card":
        return "w-full h-24 rounded-2xl";
      case "rectangular":
      default:
        return "rounded-xl";
    }
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "animate-shimmer overflow-hidden select-none",
        getVariantStyles(),
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

export function SkeletonEmergencyCard() {
  return (
    <div
      role="status"
      aria-label="Cargando reporte de emergencia..."
      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm flex flex-col gap-3 animate-fade-in"
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="rectangular" width={100} height={20} className="rounded-full" />
        <Skeleton variant="text" width={70} height={14} />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant="text" width="65%" height={18} />
          <Skeleton variant="text" width="90%" height={14} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPictogramGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando pictogramas..."
      className="tipify-grid"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)]"
          style={{ width: 116, minHeight: 140 }}
        >
          <Skeleton variant="rectangular" width={96} height={96} className="rounded-xl mb-2" />
          <Skeleton variant="text" width={60} height={12} />
        </div>
      ))}
    </div>
  );
}
