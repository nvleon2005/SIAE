"use client";

import { useEffect } from "react";
import { defaultLocalProfile, readProfileFromDb } from "@/src/lib/profile-db";

export function useApplyAccessibility() {
  useEffect(() => {
    let isActive = true;

    const apply = async () => {
      try {
        const profile = (await readProfileFromDb()) ?? defaultLocalProfile;
        if (!isActive) return;

        const root = document.documentElement;
        root.style.setProperty("--font-scale", String(profile.fontScale ?? 1));
        root.lang = profile.preferredLocale || "es";
        root.dataset.theme = profile.theme ?? "light";
        root.dataset.reducedMotion = String(Boolean(profile.reducedMotion));
        root.dataset.pictogramsOnly = String(Boolean(profile.pictogramsOnly));
        root.dataset.easyRead = String(Boolean(profile.easyRead));
      } catch {
        if (!isActive) return;
        const root = document.documentElement;
        root.style.setProperty("--font-scale", "1");
        root.dataset.theme = "light";
      }
    };

    void apply();

    return () => {
      isActive = false;
    };
  }, []);
}
