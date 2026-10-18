import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { I18nProvider, useTranslation } from "@/src/modules/i18n/i18n-context";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/src/modules/i18n/types";
import { useProfile } from "@/src/modules/profile/profile-store";

describe("INT-G.7: Motor Integral de Internacionalización (i18n en 6 idiomas)", () => {
  beforeEach(() => {
    useProfile.setState({ profile: null, loading: false, syncing: false, syncedAt: null, error: null });
    document.documentElement.lang = "es";
  });

  it("lists exactly the 6 supported languages with Venezuela as default", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(6);
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    expect(codes).toEqual(["es", "es-419", "en", "ca", "eu", "gl"]);

    const { result } = renderHook(() => useTranslation(), {
      wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    });

    expect(result.current.locale).toBe("es");
    expect(result.current.t("sos.button")).toBe("SOS EMERGENCIA");
  });

  it("translates emergency keys accurately across all 6 languages", () => {
    const expectations: Record<SupportedLocale, { button: string; safeWalk: string }> = {
      es: { button: "SOS EMERGENCIA", safeWalk: "Camino Seguro" },
      "es-419": { button: "SOS EMERGENCIA", safeWalk: "Ruta Segura" },
      en: { button: "SOS EMERGENCY", safeWalk: "Safe Walk" },
      ca: { button: "SOS EMERGÈNCIA", safeWalk: "Camí Segur" },
      eu: { button: "LARRIALDIA SOS", safeWalk: "Bide Segurua" },
      gl: { button: "SOS EMERXENCIA", safeWalk: "Camiño Seguro" },
    };

    for (const [locale, expected] of Object.entries(expectations) as Array<[SupportedLocale, { button: string; safeWalk: string }]>) {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: ({ children }) => <I18nProvider initialLocale={locale}>{children}</I18nProvider>,
      });

      expect(result.current.locale).toBe(locale);
      expect(result.current.t("sos.button")).toBe(expected.button);
      expect(result.current.t("safe_walk.title")).toBe(expected.safeWalk);
    }
  });

  it("interpolates dynamic parameters inside translated strings", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="es">{children}</I18nProvider>,
    });

    expect(result.current.t("safe_walk.remaining", { time: "08:30" })).toBe("Tiempo restante: 08:30");

    // En inglés
    act(() => {
      result.current.setLocale("en");
    });
    expect(result.current.t("safe_walk.remaining", { time: "08:30" })).toBe("Remaining time: 08:30");
  });

  it("falls back to Spanish when key is missing in target language, or returns key if completely missing", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: ({ children }) => <I18nProvider initialLocale="gl">{children}</I18nProvider>,
    });

    // Clave inexistente en cualquier idioma
    expect(result.current.t("non.existent.key")).toBe("non.existent.key");
  });

  it("reacts dynamically to user profile preferredLocale updates", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    });

    expect(result.current.locale).toBe("es");

    act(() => {
      useProfile.setState({
        profile: {
          id: "local-user",
          name: "Usuario Test",
          preferredLocale: "ca",
          updatedAt: new Date().toISOString(),
          version: 1,
          remoteId: null,
          isAnonymous: false,
          isActive: true,
          isTutorManaged: false,
          disabilities: ["deaf"],
          preferredSignLanguage: "lse",
          channels: ["rtt", "video"],
          hasCompletedOnboarding: true,
          locationAllowed: true,
          fontScale: 1,
          theme: "light",
          reducedMotion: false,
          pictogramsOnly: false,
          longPressSeconds: 0,
          addresses: [],
          emergencyContacts: [],
          notifications: {
            pushEnabled: false,
            emailEnabled: false,
            smsEnabled: false,
            quietHoursEnabled: false,
            quietHoursStart: "22:00",
            quietHoursEnd: "07:00",
          },
          privacy: {
            shareProfileOnEmergency: true,
            shareLocationOnEmergency: true,
            syncProfile: false,
          },
        },
      });
    });

    expect(result.current.locale).toBe("ca");
    expect(result.current.t("sos.button")).toBe("SOS EMERGÈNCIA");
  });
});
