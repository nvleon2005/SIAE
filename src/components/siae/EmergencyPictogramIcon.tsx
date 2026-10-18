import React from "react";

export type EmergencyIconKey =
  | "medical"
  | "cardiac"
  | "respiratory"
  | "wound"
  | "fall"
  | "ambulance"
  | "accident"
  | "traffic"
  | "pedestrian"
  | "fire"
  | "flames"
  | "fire_engine"
  | "smoke"
  | "violence"
  | "assault"
  | "robbery"
  | "weapon_knife"
  | "weapon_gun"
  | "domestic"
  | "security"
  | "police"
  | "theft"
  | "natural_disaster"
  | "flood"
  | "other"
  | "general";

interface EmergencyPictogramIconProps {
  name: EmergencyIconKey | string;
  size?: number;
  className?: string;
}

export function EmergencyPictogramIcon({
  name,
  size = 64,
  className = "",
}: EmergencyPictogramIconProps) {
  const iconKey = normalizeIconKey(name);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {renderIconPath(iconKey)}
    </svg>
  );
}

function normalizeIconKey(name: string): EmergencyIconKey {
  const n = name.toLowerCase().trim();
  if (n.includes("assault") || n.includes("agres") || n.includes("pelea") || n.includes("golpe físico")) return "assault";
  if (n.includes("rob") || n.includes("atrac") || n.includes("ladron") || n.includes("hurto")) return "robbery";
  if (n.includes("violenc")) return "violence";
  if (n.includes("cardiac") || n.includes("coraz") || n.includes("infarto") || n.includes("pecho")) return "cardiac";
  if (n.includes("respir") || n.includes("asfix") || n.includes("ahogo") || n.includes("aire")) return "respiratory";
  if (n.includes("wound") || n.includes("sangr") || n.includes("herida") || n.includes("corte")) return "wound";
  if (n.includes("fall") || n.includes("caíd") || n.includes("caida") || n.includes("altura")) return "fall";
  if (n.includes("ambulanc")) return "ambulance";
  if (n.includes("traffic") || n.includes("choque") || n.includes("vehicul")) return "traffic";
  if (n.includes("pedestrian") || n.includes("atropell") || n.includes("peaton")) return "pedestrian";
  if (n.includes("accident")) return "accident";
  if (n.includes("flame") || n.includes("fuego") || n.includes("incendio") || n.includes("llama")) return "flames";
  if (n.includes("engine") || n.includes("bomber") || n.includes("camion")) return "fire_engine";
  if (n.includes("smoke") || n.includes("humo") || n.includes("gas")) return "smoke";
  if (n.includes("fire")) return "fire";
  if (n.includes("police") || n.includes("patrulla") || n.includes("oficial")) return "police";
  if (n.includes("theft") || n.includes("asalto")) return "theft";
  if (n.includes("secur") || n.includes("segurid")) return "security";
  if (n.includes("flood") || n.includes("inund") || n.includes("lluvia") || n.includes("crecida")) return "flood";
  if (n.includes("disaster") || n.includes("desastre")) return "natural_disaster";
  if (n.includes("medic") || n.includes("salud")) return "medical";
  return "general";
}

function renderIconPath(key: EmergencyIconKey): React.ReactNode {
  switch (key) {
    // =========================================================================
    // VIOLENCIA / AGRESIÓN / ROBO (Foco explícito del reporte)
    // =========================================================================
    case "assault":
      // Puño enérgico cerrado con líneas de impacto cinético (Agresión Física)
      return (
        <g>
          {/* Fondo tonal suave */}
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fee2e2" />
          {/* Impacto / estrella de choque */}
          <path d="M46 12L48 18L54 16L50 22L56 26L49 27L51 33L45 30L43 36L40 29L46 12Z" fill="#ef4444" />
          {/* Puño cerrado */}
          <path
            d="M12 36C12 31 16 28 22 28H28C30.2 28 32 29.8 32 32C32 29.8 33.8 28 36 28C38.2 28 40 29.8 40 32C40 29.8 41.8 28 44 28C46.2 28 48 29.8 48 32V38C48 44.6 42.6 50 36 50H26C18.3 50 12 43.7 12 36Z"
            fill="#b91c1c"
            stroke="#7f1d1d"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Pulgar apretado sobre dedos */}
          <path
            d="M20 34C20 30 24 28 28 30L34 33C35.5 33.8 36 35.8 35 37.2C34.2 38.3 32.8 39 31.5 39H24C21.8 39 20 37.2 20 35V34Z"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="2"
          />
          {/* Líneas divisorias de nudillos */}
          <line x1="32" y1="32" x2="32" y2="40" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="32" x2="40" y2="40" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
          {/* Rayos de alerta */}
          <line x1="8" y1="22" x2="14" y2="25" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="14" x2="17" y2="19" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case "robbery":
      // Ladrón con antifaz / pasamontañas llevándose bolsa de dinero / atraco
      return (
        <g>
          {/* Fondo tonal suave */}
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#ede9fe" />
          {/* Silueta cabeza con pasamontañas */}
          <circle cx="28" cy="24" r="14" fill="#1e1b4b" />
          {/* Antifaz / ojos alerta */}
          <rect x="18" y="20" width="20" height="7" rx="3.5" fill="#4338ca" />
          <circle cx="23" cy="23.5" r="2" fill="#ffffff" />
          <circle cx="33" cy="23.5" r="2" fill="#ffffff" />
          <circle cx="23.5" cy="23.5" r="1" fill="#0f172a" />
          <circle cx="33.5" cy="23.5" r="1" fill="#0f172a" />
          {/* Torso con ropa oscura */}
          <path d="M14 50C14 41 20 36 28 36C33 36 37 38 40 42L44 40L47 46L40 49C37 51 32 52 28 52C20 52 14 50 14 50Z" fill="#312e81" />
          {/* Bolsa de dinero / botín con signo $ */}
          <path d="M48 28C48 26 46 25 45 25L42 27L43 23H47L48 28Z" fill="#b45309" />
          <ellipse cx="46" cy="40" rx="11" ry="11" fill="#f59e0b" stroke="#b45309" strokeWidth="2.5" />
          <text x="46" y="46" textAnchor="middle" fontSize="13" fontWeight="900" fill="#78350f" fontFamily="sans-serif">
            $
          </text>
        </g>
      );

    case "violence":
      // Escudo octogonal de peligro con mano/fist de detención y advertencia
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fce7f3" />
          {/* Triángulo/octágono de peligro */}
          <path d="M32 8L54 20V36C54 46 44 53 32 56C20 53 10 46 10 36V20L32 8Z" fill="#be185d" stroke="#831843" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Puño o mano de contención */}
          <path
            d="M32 20C27 20 23 23 23 28V36C23 41 27 44 32 44C37 44 41 41 41 36V28C41 23 37 20 32 20Z"
            fill="#ffffff"
          />
          <path d="M32 24V34M28 26V32M36 26V32" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case "domestic":
      // Violencia doméstica: hogar con escudo de auxilio y mano de protección
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fdf2f8" />
          {/* Casa */}
          <path d="M32 10L14 24H20V46H44V24H50L32 10Z" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" strokeLinejoin="round" />
          {/* Escudo protector / alerta */}
          <path d="M32 22L40 26V35C40 40 36 43 32 44C28 43 24 40 24 35V26L32 22Z" fill="#db2777" stroke="#9d174d" strokeWidth="1.5" />
          {/* Mano de auxilio */}
          <circle cx="32" cy="30" r="2.5" fill="#ffffff" />
          <path d="M32 33V39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // MÉDICO / SALUD / URGENCIAS
    // =========================================================================
    case "medical":
      // Cruz roja de emergencia médica en círculo blanco con pulso
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fee2e2" />
          <circle cx="32" cy="32" r="22" fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" />
          {/* Cruz roja */}
          <path
            d="M28 17H36V28H47V36H36V47H28V36H17V28H28V17Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      );

    case "cardiac":
      // Corazón de emergencia con electrocardiograma (ECG) rítmico
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#ffe4e6" />
          <path
            d="M32 52L14 34C9 29 9 20 15 15C21 10 28 12 32 18C36 12 43 10 49 15C55 20 55 29 50 34L32 52Z"
            fill="#e11d48"
            stroke="#9f1239"
            strokeWidth="2"
          />
          {/* Línea ECG */}
          <path
            d="M10 32H22L25 24L29 40L33 21L37 36L40 32H54"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case "respiratory":
      // Pulmones anatómicos con flechas de inhalación/dificultad respiratoria
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#e0f2fe" />
          {/* Tráquea */}
          <path d="M32 10V26M32 26L24 33M32 26L40 33" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          {/* Pulmón izquierdo */}
          <path
            d="M23 28C16 28 12 34 12 42C12 49 16 52 23 52C28 52 30 47 30 40V33L23 28Z"
            fill="#38bdf8"
            stroke="#0369a1"
            strokeWidth="2.5"
          />
          {/* Pulmón derecho */}
          <path
            d="M41 28C48 28 52 34 52 42C52 49 48 52 41 52C36 52 34 47 34 40V33L41 28Z"
            fill="#38bdf8"
            stroke="#0369a1"
            strokeWidth="2.5"
          />
          {/* Alerta de asfixia */}
          <circle cx="32" cy="14" r="3" fill="#ef4444" />
          <path d="M28 18L32 22L36 18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );

    case "wound":
      // Vendaje médico con gotas de sangre y cruz
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fef2f2" />
          {/* Vendaje / parche */}
          <rect
            x="14"
            y="22"
            width="36"
            height="20"
            rx="10"
            transform="rotate(-20 32 32)"
            fill="#fcd34d"
            stroke="#b45309"
            strokeWidth="2.5"
          />
          {/* Gota de sangre */}
          <path
            d="M44 38C44 43 40 47 35 47C30 47 26 43 26 38C26 34 32 26 35 23C38 26 44 34 44 38Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="2"
          />
          {/* Pequeña gota satélite */}
          <circle cx="48" cy="46" r="3" fill="#dc2626" />
        </g>
      );

    case "fall":
      // Persona cayendo hacia atrás / impacto en el suelo
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fffbeb" />
          {/* Suelo */}
          <line x1="8" y1="52" x2="56" y2="52" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          {/* Cabeza */}
          <circle cx="20" cy="24" r="6" fill="#d97706" />
          {/* Cuerpo en caída desequilibrada */}
          <path d="M24 28L32 40L42 38L48 30" stroke="#b45309" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Piernas */}
          <path d="M32 40L28 50M32 40L38 48" stroke="#b45309" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Destello de impacto */}
          <path d="M26 46L22 49M30 44L32 48M22 44L26 44" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case "ambulance":
      // Ambulancia de urgencias médicas
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fee2e2" />
          {/* Sirena */}
          <path d="M30 13H34V16H30V13Z" fill="#3b82f6" />
          <circle cx="32" cy="11" r="2" fill="#ef4444" />
          {/* Carrocería ambulancia */}
          <path
            d="M10 24C10 21.8 11.8 20 14 20H40C42.2 20 44 21.8 44 24V28L52 32V42C52 43.1 51.1 44 50 44H10V24Z"
            fill="#ffffff"
            stroke="#991b1b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Parabrisas */}
          <path d="M44 28H50L45 23H41V28Z" fill="#38bdf8" />
          {/* Cruz roja en ambulancia */}
          <path d="M24 26H28V38H24V26ZM20 30H32V34H20V30Z" fill="#dc2626" />
          {/* Ruedas */}
          <circle cx="19" cy="44" r="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="43" cy="44" r="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      );

    // =========================================================================
    // ACCIDENTE / TRÁFICO / CHOQUE
    // =========================================================================
    case "accident":
    case "traffic":
      // Choque de dos vehículos con estallido de colisión
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fef3c7" />
          {/* Vehículo 1 (izq) */}
          <path d="M8 38L14 30H24L28 38H8Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="8" y="38" width="20" height="8" rx="2" fill="#3b82f6" />
          <circle cx="13" cy="46" r="3.5" fill="#1e293b" />
          <circle cx="23" cy="46" r="3.5" fill="#1e293b" />
          {/* Vehículo 2 (der) */}
          <path d="M56 38L50 30H40L36 38H56Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
          <rect x="36" y="38" width="20" height="8" rx="2" fill="#ef4444" />
          <circle cx="41" cy="46" r="3.5" fill="#1e293b" />
          <circle cx="51" cy="46" r="3.5" fill="#1e293b" />
          {/* Explosión / impacto frontal central */}
          <path
            d="M32 20L34 26L40 23L36 29L43 32L36 35L39 41L33 37L31 43L29 36L23 38L27 32L21 28L28 27L26 21L32 25V20Z"
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="1.5"
          />
        </g>
      );

    case "pedestrian":
      // Atropello a peatón
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fee2e2" />
          {/* Peatón cayendo */}
          <circle cx="24" cy="18" r="5" fill="#b91c1c" />
          <path d="M24 23L22 34M22 34L15 42M22 34L28 40" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M23 27L16 25M23 27L30 30" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          {/* Frente de auto aproximándose */}
          <path d="M38 34L44 26H56V48H38L34 40L38 34Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
          <circle cx="46" cy="48" r="4" fill="#1e293b" />
          {/* Líneas de frenado/impacto */}
          <line x1="28" y1="36" x2="35" y2="34" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // FUEGO / BOMBEROS / INCENDIO
    // =========================================================================
    case "fire":
    case "flames":
      // Llamas ardientes en capas de color fuego
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#ffedd5" />
          {/* Llama exterior roja */}
          <path
            d="M32 8C32 8 44 20 44 34C44 45 38 52 32 52C26 52 20 45 20 34C20 22 28 14 32 8Z"
            fill="#ea580c"
          />
          {/* Llama intermedia naranja */}
          <path
            d="M32 18C32 18 41 26 41 37C41 45 36 49 32 49C28 49 23 45 23 37C23 28 29 22 32 18Z"
            fill="#f97316"
          />
          {/* Núcleo amarillo brillante */}
          <path
            d="M32 28C32 28 37 34 37 40C37 45 34 47 32 47C30 47 27 45 27 40C27 34 30 30 32 28Z"
            fill="#fde047"
          />
          {/* Chispas laterales */}
          <circle cx="16" cy="24" r="2.5" fill="#ea580c" />
          <circle cx="48" cy="20" r="3" fill="#ea580c" />
        </g>
      );

    case "fire_engine":
      // Camión de bomberos con escalera extensible
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fee2e2" />
          {/* Escalera arriba */}
          <line x1="14" y1="16" x2="42" y2="16" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="20" x2="42" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="16" x2="20" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="28" y1="16" x2="28" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="36" y1="16" x2="36" y2="20" stroke="#94a3b8" strokeWidth="2" />
          {/* Camión rojo */}
          <path
            d="M10 24H38V28H50L54 36V44H10V24Z"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Cabina ventana */}
          <path d="M40 28H48L51 35H40V28Z" fill="#e0f2fe" />
          {/* Sirena */}
          <circle cx="45" cy="24" r="2.5" fill="#3b82f6" />
          {/* Ruedas */}
          <circle cx="18" cy="44" r="5" fill="#1e293b" />
          <circle cx="46" cy="44" r="5" fill="#1e293b" />
        </g>
      );

    case "smoke":
      // Humo denso y gas tóxico
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#f1f5f9" />
          <circle cx="24" cy="38" r="10" fill="#94a3b8" />
          <circle cx="38" cy="36" r="12" fill="#64748b" />
          <circle cx="30" cy="24" r="11" fill="#475569" />
          <circle cx="42" cy="22" r="8" fill="#334155" />
          {/* Fuga o chimenea inferior */}
          <path d="M22 52L26 44H38L42 52H22Z" fill="#1e293b" />
        </g>
      );

    // =========================================================================
    // SEGURIDAD / POLICÍA
    // =========================================================================
    case "security":
    case "police":
      // Escudo oficial de policía con estrella de 6 puntas y destellos
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#dbeafe" />
          {/* Escudo azul */}
          <path
            d="M32 8L50 16V32C50 44 42 51 32 55C22 51 14 44 14 32V16L32 8Z"
            fill="#1d4ed8"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Estrella dorada policial */}
          <path
            d="M32 20L34.5 27.5H42.5L36 32L38.5 39.5L32 35L25.5 39.5L28 32L21.5 27.5H29.5L32 20Z"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />
        </g>
      );

    case "theft":
      // Cerradura rota / intrusión
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#fef3c7" />
          {/* Candado abierto */}
          <path
            d="M24 28V20C24 15.6 27.6 12 32 12C36.4 12 40 15.6 40 20V24"
            stroke="#dc2626"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="18" y="26" width="28" height="24" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2.5" />
          <circle cx="32" cy="36" r="3" fill="#78350f" />
          <path d="M32 39V43" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // DESASTRE NATURAL / INUNDACIÓN
    // =========================================================================
    case "natural_disaster":
    case "flood":
      // Olas crecidas cubriendo casa / inundación
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#ccfbf1" />
          {/* Casa semicubierta */}
          <path d="M32 16L18 28H22V42H42V28H46L32 16Z" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
          <rect x="29" y="32" width="6" height="10" fill="#7c2d12" />
          {/* Olas de agua */}
          <path
            d="M8 40C14 36 20 44 26 40C32 36 38 44 44 40C50 36 56 44 60 40V56H8V40Z"
            fill="#0284c7"
            opacity="0.85"
          />
          <path
            d="M8 47C14 43 20 50 26 47C32 43 38 50 44 47C50 43 56 50 60 47V56H8V47Z"
            fill="#0369a1"
          />
          {/* Gotas de lluvia */}
          <line x1="20" y1="12" x2="18" y2="18" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="10" x2="40" y2="16" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="8" x2="30" y2="14" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // AUXILIO GENERAL / OTRO
    // =========================================================================
    case "other":
    case "general":
    default:
      // Megáfono de alerta y auxilio con ondas expansivas
      return (
        <g>
          <rect x="4" y="4" width="56" height="56" rx="14" fill="#ede9fe" />
          {/* Megáfono */}
          <path
            d="M14 26H20L34 16V44L20 34H14C12.9 34 12 33.1 12 32V28C12 26.9 12.9 26 14 26Z"
            fill="#6366f1"
            stroke="#4338ca"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Mango */}
          <path d="M22 34V46C22 47.1 21.1 48 20 48H18" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />
          {/* Ondas sonoras */}
          <path d="M38 24C41 27 41 33 38 36" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 19C49 24 49 36 44 41" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 14C57 21 57 39 50 46" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
  }
}
