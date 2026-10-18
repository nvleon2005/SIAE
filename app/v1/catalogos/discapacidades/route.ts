import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Catálogo maestro oficial de discapacidades reconocidas en SIAE
 * Alineado con app/Grpc/internal/infrastructure/catalogs/discapacidades.json
 * y la Ley para Personas con Discapacidad / Art. 81 CRBV
 */
const DISCAPACIDADES_CATALOGO = [
  {
    id: "sordera",
    codigo: "deaf",
    nombre: "Sordera profunda / Hipoacusia",
    descripcion: "Pérdida auditiva significativa o total. Requiere Lengua de Señas Venezolana (LSV) o RTT.",
    canalPrioritario: "video_sign_lse",
    apoyosRequeridos: ["LSV", "RTT", "Subtítulos en vivo"],
  },
  {
    id: "ceguera",
    codigo: "blind",
    nombre: "Ceguera total",
    descripcion: "Pérdida total de la visión. Requiere sintetizador de voz (TTS) y comandos sonoros.",
    canalPrioritario: "voz",
    apoyosRequeridos: ["Audiodescripción", "Activación por voz", "Lector de pantalla"],
  },
  {
    id: "baja_vision",
    codigo: "low_vision",
    nombre: "Baja visión",
    descripcion: "Limitación visual severa no corregible. Requiere temas de alto contraste y escalado 300%.",
    canalPrioritario: "rtt",
    apoyosRequeridos: ["Alto contraste amarillo/negro", "Tipografía agrandada", "Zoom"],
  },
  {
    id: "sordoceguera",
    codigo: "deafblind",
    nombre: "Sordoceguera",
    descripcion: "Pérdida combinada de visión y audición. Requiere terminales Braille y vibración háptica.",
    canalPrioritario: "rtt",
    apoyosRequeridos: ["Línea Braille", "Alertas hápticas", "Guía táctil"],
  },
  {
    id: "motora",
    codigo: "motor",
    nombre: "Discapacidad motora o física",
    descripcion: "Dificultad o imposibilidad de movimiento en extremidades. Requiere pulsadores y switches.",
    canalPrioritario: "voz",
    apoyosRequeridos: ["Pulsador externo (Switch)", "WebHID", "Navegación por teclado simplificada"],
  },
  {
    id: "cognitiva",
    codigo: "cognitive",
    nombre: "Discapacidad cognitiva / intelectual",
    descripcion: "TEA, Síndrome de Down, dificultades del lenguaje. Requiere pictogramas ARASAAC y Lectura Fácil.",
    canalPrioritario: "pictogramas",
    apoyosRequeridos: ["Lectura Fácil", "Pictogramas ARASAAC", "Textos simplificados"],
  },
  {
    id: "adulto_mayor",
    codigo: "elderly",
    nombre: "Adulto mayor / Movilidad reducida",
    descripcion: "Limitaciones motrices o sensoriales asociadas a la edad avanzada.",
    canalPrioritario: "voz",
    apoyosRequeridos: ["Botón SOS directo", "Tipografía clara", "Confirmación telefónica asistida"],
  },
];

export async function GET() {
  return NextResponse.json({
    discapacidades: DISCAPACIDADES_CATALOGO,
    total: DISCAPACIDADES_CATALOGO.length,
    jurisdiccion: "SIAE / VEN 911 Monagas",
    normativa: "Ley para las Personas con Discapacidad / Art. 81 CRBV",
  });
}
