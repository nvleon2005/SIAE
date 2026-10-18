/**
 * Módulo de Seguridad y Sanitización para SIAE
 * Previene Inyección SQL, XSS, Inyección de datos y ataques de denegación de servicio.
 * Conforme a estándares de seguridad OWASP y especificación 08-module-auth.md.
 */

// Patrones comunes de inyección SQL (uniones, escapes de comillas, comentarios, comandos DDL/DML)
export const SQL_INJECTION_PATTERN =
  /('|"|;|--|\/\*|\*\/|\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|OR|AND|EXEC|EXECUTE|WHERE|LIMIT|FROM|TABLE|INFORMATION_SCHEMA)\b)/i;

// Patrones comunes de XSS e inyección de script
export const XSS_SCRIPT_PATTERN =
  /(<script|javascript:|onerror=|onload=|onclick=|<iframe|<img|<svg|<embed|<object|data:text\/html)/i;

// Detección estricta de acentos, tildes y diacríticos
export const ACCENT_PATTERN = /[áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ´`^¨~]/;

// Nombres estrictamente alfabéticos estándar (solo A-Z, a-z y espacios)
export const STRICT_NAME_PATTERN = /^[a-zA-Z\s]+$/;

// Regex estricto para RFC 5322 en correos electrónicos
export const STRICT_EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Sanitiza una cadena de texto eliminando caracteres nulos, de control y espacios sobrantes.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "") // Eliminar null bytes
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // Eliminar caracteres de control invisibles
    .trim();
}

/**
 * Verifica si una cadena contiene vectores potenciales de inyección SQL.
 */
export function hasSqlInjectionRisk(text: string): boolean {
  if (!text) return false;
  return SQL_INJECTION_PATTERN.test(text);
}

/**
 * Verifica si una cadena contiene vectores potenciales de XSS o ejecución de scripts.
 */
export function hasXssRisk(text: string): boolean {
  if (!text) return false;
  return XSS_SCRIPT_PATTERN.test(text);
}

/**
 * Verifica si una cadena contiene caracteres con acentos, tildes o diacríticos.
 */
export function hasAccents(text: string): boolean {
  if (!text) return false;
  return ACCENT_PATTERN.test(text);
}

/**
 * Verifica si un nombre contiene caracteres no permitidos (debe contener solo letras A-Z y espacios).
 */
export function hasSpecialCharsInName(text: string): boolean {
  if (!text) return false;
  return !STRICT_NAME_PATTERN.test(text);
}

/**
 * Evalúa la fortaleza de una contraseña calculando entropía básica y requisitos de seguridad.
 * Retorna un puntaje de 0 a 4 y retroalimentación en lenguaje natural.
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: "Muy Débil" | "Débil" | "Aceptable" | "Fuerte" | "Muy Fuerte";
  color: string;
  feedback: string[];
} {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, label: "Muy Débil", color: "bg-slate-300", feedback: ["Introduce una contraseña."] };
  }

  let points = 0;

  if (password.length >= 8) points += 1;
  else feedback.push("Debe tener al menos 8 caracteres.");

  if (password.length >= 12) points += 1;
  else if (password.length >= 8) feedback.push("Se recomiendan 12 caracteres o más.");

  if (/[A-Z]/.test(password)) points += 1;
  else feedback.push("Añade al menos una letra mayúscula.");

  if (/[a-z]/.test(password)) points += 1;
  else feedback.push("Añade al menos una letra minúscula.");

  if (/[0-9]/.test(password)) points += 1;
  else feedback.push("Añade al menos un número.");

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) points += 1;
  else feedback.push("Añade al menos un carácter especial (@, #, $, etc.).");

  // Penalización por contraseñas comunes o secuencias predecibles
  const commonPasswords = ["12345678", "password123", "admin12345", "123456789012", "siae2026"];
  if (commonPasswords.includes(password.toLowerCase())) {
    points = 1;
    feedback.push("Esta contraseña es demasiado común y predecible.");
  }

  // Normalización a escala de 0 a 4
  let score = 0;
  if (points >= 5) score = 4;
  else if (points >= 4) score = 3;
  else if (points >= 3) score = 2;
  else if (points >= 2) score = 1;
  else score = 0;

  const labels: Array<"Muy Débil" | "Débil" | "Aceptable" | "Fuerte" | "Muy Fuerte"> = [
    "Muy Débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Muy Fuerte",
  ];
  const colors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-green-600",
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    feedback,
  };
}
