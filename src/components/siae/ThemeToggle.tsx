"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useProfile } from "@/src/modules/profile/profile-store";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const profile = useProfile((state) => state.profile);
  const loadProfile = useProfile((state) => state.load);
  const updateProfile = useProfile((state) => state.update);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!profile) {
      void loadProfile();
    }
  }, [loadProfile, profile]);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Cambiando tema"
        className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold opacity-70 ${className}`}
        suppressHydrationWarning
      >
        <Moon className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
        {showLabel && <span>Tema</span>}
      </button>
    );
  }

  const currentTheme = profile?.theme ?? "light";
  const isDark = currentTheme === "dark" || currentTheme === "high_contrast" || currentTheme === "yellow_black";

  const handleToggle = async () => {
    triggerHapticFeedback("tap");
    const nextTheme = isDark ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
    }
    await updateProfile({ theme: nextTheme });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      suppressHydrationWarning
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer select-none ${
        isDark
          ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[var(--accent)] shadow-2xs"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 animate-pulse" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
      )}
      {showLabel && (
        <span>{isDark ? "Tema Claro" : "Tema Oscuro"}</span>
      )}
    </button>
  );
}
