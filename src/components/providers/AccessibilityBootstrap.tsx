"use client";

import { useEffect, useState } from "react";
import { defaultLocalProfile, readProfileFromDb } from "@/src/lib/profile-db";
import { useCriticalBattery } from "@/src/modules/a11y/use-critical-battery";

export function AccessibilityBootstrap() {
  useCriticalBattery();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const applyProfile = (profile: any) => {
      if (!profile || typeof document === "undefined") return;
      const root = document.documentElement;
      root.style.setProperty("--font-scale", String(profile.fontScale ?? 1));
      root.lang = profile.preferredLocale || "es";
      root.dataset.theme = profile.theme ?? "light";
      root.dataset.reducedMotion = String(Boolean(profile.reducedMotion));
      root.dataset.pictogramsOnly = String(Boolean(profile.pictogramsOnly));
      root.dataset.easyRead = String(Boolean(profile.easyRead));

      const isStandaloneMode =
        (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) ||
        (typeof navigator !== "undefined" && "standalone" in navigator && Boolean((navigator as unknown as { standalone?: boolean }).standalone));
      root.dataset.displayMode = isStandaloneMode ? "standalone" : "browser";
      root.dataset.pwa = String(isStandaloneMode);
    };

    const apply = async () => {
      try {
        const profile = (await readProfileFromDb()) ?? defaultLocalProfile;
        if (!isMounted) return;
        applyProfile(profile);
      } catch {
        const root = document.documentElement;
        root.style.setProperty("--font-scale", "1");
        root.dataset.theme = "light";
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    };

    const handleProfileChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        applyProfile(customEvent.detail);
      } else {
        void apply();
      }
    };

    apply();
    window.addEventListener("siae-profile-changed", handleProfileChanged);

    const handleMouseMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".fluent-card") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener("siae-profile-changed", handleProfileChanged);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
