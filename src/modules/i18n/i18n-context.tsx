"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { SupportedLocale, LocaleInfo } from "./types";
import { SUPPORTED_LOCALES } from "./types";
import { dictionaries } from "./dictionaries";
import { useProfile } from "@/src/modules/profile/profile-store";

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLocales: LocaleInfo[];
}

const I18nContext = createContext<I18nContextType | null>(null);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}) {
  const profileLocale = useProfile((state) => state.profile?.preferredLocale);
  const [userSelectedLocale, setUserSelectedLocale] = useState<SupportedLocale | null>(null);

  // Derivar locale activo de forma pura y reactiva
  const activeLocale: SupportedLocale = useMemo(() => {
    if (userSelectedLocale) return userSelectedLocale;
    if (initialLocale && initialLocale in dictionaries) return initialLocale;
    if (profileLocale && profileLocale in dictionaries) return profileLocale as SupportedLocale;
    return "es";
  }, [userSelectedLocale, initialLocale, profileLocale]);

  // Actualizar atributo html lang de forma accesible ante cambios de locale
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = activeLocale;
    }
  }, [activeLocale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (newLocale in dictionaries) {
      setUserSelectedLocale(newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentDict = dictionaries[activeLocale] || dictionaries.es;
      let rawText = currentDict[key];

      // Fallback a español si la clave no existe en el idioma seleccionado
      if (!rawText && activeLocale !== "es") {
        rawText = dictionaries.es[key];
      }

      if (!rawText) {
        return key;
      }

      return interpolate(rawText, params);
    },
    [activeLocale]
  );

  const value = useMemo(
    () => ({
      locale: activeLocale,
      setLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [activeLocale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Retorno de fallback seguro si se invoca fuera del Provider
    const fallbackT = (key: string, params?: Record<string, string | number>) => {
      const rawText = dictionaries.es[key] || key;
      return interpolate(rawText, params);
    };

    return {
      locale: "es",
      setLocale: () => {},
      t: fallbackT,
      supportedLocales: SUPPORTED_LOCALES,
    };
  }
  return context;
}
