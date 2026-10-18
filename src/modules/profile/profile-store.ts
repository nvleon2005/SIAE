import { create } from "zustand";
import {
  defaultLocalProfile,
  readProfileFromDb,
  resetAccessibilityProfile,
  saveProfileToDb,
  type LocalProfileRecord,
} from "@/src/lib/profile-db";
import { saveRemoteProfile, syncProfileWithBackend } from "./profile-sync";
import { useAuth } from "@/src/modules/auth/auth-store";

interface ProfileState {
  profile: LocalProfileRecord | null;
  loading: boolean;
  syncing: boolean;
  syncedAt: string | null;
  error: string | null;
  load: () => Promise<void>;
  update: (patch: Partial<LocalProfileRecord>) => Promise<void>;
  syncWithBackend: () => Promise<boolean>;
  resetAccessibility: () => Promise<void>;
  clearError: () => void;
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  syncing: false,
  syncedAt: null,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const profile = (await readProfileFromDb()) ?? defaultLocalProfile;
      set({ profile, loading: false });
    } catch {
      set({ profile: defaultLocalProfile, loading: false, error: "No se pudo cargar el perfil local." });
    }
  },
  update: async (patch) => {
    const current = get().profile ?? defaultLocalProfile;
    const next = { ...current, ...patch };
    set({ profile: next, error: null });
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (patch.theme) root.dataset.theme = patch.theme;
      if (patch.preferredLocale) root.lang = patch.preferredLocale;
      if (patch.fontScale !== undefined) root.style.setProperty("--font-scale", String(patch.fontScale));
      if (patch.reducedMotion !== undefined) root.dataset.reducedMotion = String(Boolean(patch.reducedMotion));
      if (patch.pictogramsOnly !== undefined) root.dataset.pictogramsOnly = String(Boolean(patch.pictogramsOnly));
      if (patch.easyRead !== undefined) root.dataset.easyRead = String(Boolean(patch.easyRead));
    }
    try {
      await saveProfileToDb(next);
      // If user is authenticated, sync remote profile in background
      if (useAuth.getState().isAuthenticated) {
        void saveRemoteProfile(next).then((ok) => {
          if (ok) {
            set({ syncedAt: new Date().toISOString() });
          }
        }).catch(() => {
          // Graceful offline fallback
        });
      }
    } catch {
      set({ error: "No se pudo guardar el perfil local." });
      throw new Error("PROFILE_SAVE_FAILED");
    }
  },
  syncWithBackend: async () => {
    if (!useAuth.getState().isAuthenticated) {
      return false;
    }
    set({ syncing: true, error: null });
    try {
      const res = await syncProfileWithBackend();
      if (res.success && res.profile) {
        set({ profile: res.profile, syncing: false, syncedAt: res.syncedAt ?? new Date().toISOString() });
        return true;
      }
      set({ syncing: false, error: res.error ?? null });
      return false;
    } catch {
      set({ syncing: false, error: "Fallo de sincronización" });
      return false;
    }
  },
  resetAccessibility: async () => {
    try {
      const profile = await resetAccessibilityProfile();
      set({ profile, error: null });
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.dataset.theme = profile.theme ?? "light";
        root.lang = profile.preferredLocale || "es";
        root.style.setProperty("--font-scale", String(profile.fontScale ?? 1));
        root.dataset.reducedMotion = String(Boolean(profile.reducedMotion));
        root.dataset.pictogramsOnly = String(Boolean(profile.pictogramsOnly));
        root.dataset.easyRead = String(Boolean(profile.easyRead));
      }
      if (useAuth.getState().isAuthenticated) {
        void saveRemoteProfile(profile);
      }
    } catch {
      set({ error: "No se pudo restablecer la accesibilidad." });
      throw new Error("PROFILE_RESET_FAILED");
    }
  },
  clearError: () => set({ error: null }),
}));
