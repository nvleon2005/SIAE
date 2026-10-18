export function formatEmergencyCode(code: number) {
  return `SIAE-${code.toString().padStart(4, "0")}`;
}
