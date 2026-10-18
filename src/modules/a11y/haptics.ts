/**
 * SIAE — Módulo de Retroalimentación Háptica Accesible
 * Provee patrones de vibración táctil para confirmaciones y alertas críticas (WCAG 2.2 / EN 301 549).
 */

export type HapticPattern = "tap" | "sos" | "success" | "warning" | "error";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  // Toque táctil ligero de confirmación (50ms)
  tap: 50,
  // Patrón rítmico de emergencia SOS (... --- ...) simplificado para háptica (150ms vibración, 80ms pausa, 250ms vibración)
  sos: [150, 80, 250, 80, 150],
  // Doble pulso breve de guardado o éxito (60ms, 40ms, 60ms)
  success: [60, 40, 60],
  // Pulso mediano de precaución (180ms)
  warning: 180,
  // Triple pulso de advertencia de error o intento inválido
  error: [100, 50, 100, 50, 120],
};

/**
 * Dispara una vibración háptica en dispositivos móviles compatibles.
 * Degrada silenciosamente sin errores en navegadores de escritorio o entornos sin hardware vibrador.
 */
export function triggerHapticFeedback(pattern: HapticPattern = "tap"): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  // Respetar preferencia de reducción de movimiento / descanso sensorial si está activa
  try {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)")?.matches : false;
    const documentReducedMotion = document.documentElement.getAttribute("data-reduced-motion") === "true";
    if (prefersReducedMotion || documentReducedMotion) {
      return false;
    }

    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      const vibrationValue = PATTERNS[pattern] ?? 50;
      return navigator.vibrate(vibrationValue);
    }
  } catch {
    // Protección ante permisos restringidos en iframes o navegadores restringidos
    return false;
  }

  return false;
}
