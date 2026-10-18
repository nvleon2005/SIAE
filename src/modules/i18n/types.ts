export type SupportedLocale = "es" | "es-419" | "en" | "ca" | "eu" | "gl";

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: "es", name: "Español (Venezuela)", nativeName: "Español (Venezuela)", flag: "🇻🇪" },
  { code: "es-419", name: "Español (Latinoamérica)", nativeName: "Español (Latinoamérica)", flag: "🌎" },
  { code: "en", name: "Inglés", nativeName: "English", flag: "🇬🇧" },
  { code: "ca", name: "Catalán", nativeName: "Català", flag: "🏴" },
  { code: "eu", name: "Euskera", nativeName: "Euskara", flag: "🏴" },
  { code: "gl", name: "Gallego", nativeName: "Galego", flag: "🏴" },
];

export type TranslationDict = Record<string, string>;
