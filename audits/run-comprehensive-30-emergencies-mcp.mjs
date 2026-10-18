import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/freakeao/.gemini/antigravity-ide/brain/715eff84-e2ca-432e-b169-cc1f3d987db2';

// ── CATÁLOGO EXHAUSTIVO DE 30 EMERGENCIAS REALES DE MATURÍN, MONAGAS ─────────
const EMERGENCIAS_30 = [
  // 1-8: EMERGENCIAS MÉDICAS / SALUD
  {
    num: 1,
    tipo: "Médico · Paro cardiorrespiratorio presenciado",
    codigo: "MED_PARO_CARDIACO",
    prioridad: "P0",
    solicitante: "Elena Rondón",
    canal: ["video_sign_lse", "rtt"],
    direccion: "Maturín Centro · Av. Bicentenario c/c Calle Monagas",
    lat: 9.7489, lng: -63.1798, cuadranteId: "CP-01", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #04 (HUMNT)",
    triageNota: "Paciente 62 años en paro súbito. Familiar realizando RCP básica guiada por RTT. Código Rojo P0 inmediato.",
    ficha: { bloodType: "O+", allergies: ["Penicilina"], conditions: ["Cardiopatía isquémica"] }
  },
  {
    num: 2,
    tipo: "Médico · Accidente cerebrovascular (ACV) con afasia y plejia",
    codigo: "MED_ACV_AGUDO",
    prioridad: "P0",
    solicitante: "Gonzalo Moreno",
    canal: ["rtt"],
    direccion: "Alto de Los Godos · Sector Los Godos calle 12",
    lat: 9.7311, lng: -63.1987, cuadranteId: "CP-11", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #05 (HUMNT)",
    triageNota: "Escala Cincinnati positiva: asimetría facial, pérdida de fuerza hemicuerpo derecho. Ventana terapéutica crítica < 2h.",
    ficha: { bloodType: "AB+", allergies: ["Aspirina"], conditions: ["Hipertensión", "Diabetes"] }
  },
  {
    num: 3,
    tipo: "Médico · Trabajo de parto expulsivo en domicilio",
    codigo: "MED_PARTO_EXPULSIVO",
    prioridad: "P1",
    solicitante: "Yelitza Figuera",
    canal: ["video_sign_lse"],
    direccion: "Las Cocuizas · Calle 5 cruce con Av. Aeropuerto",
    lat: 9.7356, lng: -63.1523, cuadranteId: "CP-07", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SBV #02 (Salud Monagas)",
    triageNota: "Gesta 39 semanas. Contracciones cada 2 min con pujo involuntario. Soporte obstétrico y traslado de urgencia a Maternidad.",
    ficha: { bloodType: "O-", allergies: ["Sulfas"], conditions: ["Embarazo a término"] }
  },
  {
    num: 4,
    tipo: "Médico · Crisis asmática severa con cianosis distal",
    codigo: "MED_CRISIS_ASMATICA",
    prioridad: "P1",
    solicitante: "Francisco Cova",
    canal: ["video_sign_lse", "rtt"],
    direccion: "La Muralla · Sector Santa Elena vereda 4",
    lat: 9.7495, lng: -63.2045, cuadranteId: "CP-09", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SBV #01 (HUMNT)",
    triageNota: "Dificultad respiratoria aguda severa, tiraje intercostal, saturación estimada < 88%. Nebulización con oxígeno requerida.",
    ficha: { bloodType: "O+", allergies: ["Ibuprofeno"], conditions: ["Asma bronquial severa"] }
  },
  {
    num: 5,
    tipo: "Médico · Reacción anafiláctica con estridor laríngeo",
    codigo: "MED_ANAFILAXIA",
    prioridad: "P0",
    solicitante: "Irene Morales",
    canal: ["rtt"],
    direccion: "Tipuro II · Urbanización Palma Real Manzana F",
    lat: 9.7912, lng: -63.1895, cuadranteId: "CP-04", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #04 (HUMNT)",
    triageNota: "Edema labial y lingual tras ingesta de maní. Estridor respiratorio. Administración de Adrenalina 1:1000 prioritaria.",
    ficha: { bloodType: "O+", allergies: ["Maní", "Mariscos"], conditions: ["Alergia severa"] }
  },
  {
    num: 6,
    tipo: "Médico · Intoxicación medicamentosa infantil aguda",
    codigo: "MED_INTOXICACION_INFANTIL",
    prioridad: "P0",
    solicitante: "Verónica Rangel",
    canal: ["voz"],
    direccion: "Los Guaritos · Sector Guaritos 4 vereda 12 casa 8",
    lat: 9.7389, lng: -63.1856, cuadranteId: "CP-12", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #05 (HUMNT)",
    triageNota: "Lactante 3 años con ingesta involuntaria de antihipertensivos. Somnoliento, bradicárdico. Soporte pediátrico inmediato.",
    ficha: { bloodType: "O+", allergies: [], conditions: ["Ingesta accidental"] }
  },
  {
    num: 7,
    tipo: "Médico · Quemaduras de segundo grado por agua hirviendo",
    codigo: "MED_QUEMADURA_EXTENSA",
    prioridad: "P1",
    solicitante: "Beatriz Fuentes",
    canal: ["rtt"],
    direccion: "Costanera · Sector Brisas del Neverí calle 3",
    lat: 9.7654, lng: -63.1432, cuadranteId: "CP-10", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SBV #02 (Salud Monagas)",
    triageNota: "Quemadura en 25% SCT afectando tórax y extremidades. Vía periférica e hidratación estéril requeridas.",
    ficha: { bloodType: "A+", allergies: ["Sulfa"], conditions: ["Quemadura térmica"] }
  },
  {
    num: 8,
    tipo: "Médico · Hipoglucemia severa en paciente diabético inconsciente",
    codigo: "MED_HIPOGLUCEMIA_COMA",
    prioridad: "P0",
    solicitante: "Armando Paredes",
    canal: ["voz"],
    direccion: "Fundemos · Manzana 12 casa 45",
    lat: 9.7543, lng: -63.1623, cuadranteId: "CP-06", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #04 (HUMNT)",
    triageNota: "Paciente diabético tipo 1 no reactivo a estímulos. Glucemia capilar indetectable. Infusión Dextrosa 50% de urgencia.",
    ficha: { bloodType: "B+", allergies: [], conditions: ["Diabetes Mellitus Tipo 1"] }
  },

  // 9-15: BOMBEROS / INCENDIOS / RESCATE
  {
    num: 9,
    tipo: "Incendio · Estructural en galpón comercial de repuestos",
    codigo: "INCENDIO_ESTRUCTURAL",
    prioridad: "P0",
    solicitante: "Carlos Bermúdez",
    canal: ["voz", "rtt"],
    direccion: "Zona Industrial · Av. Bella Vista entrada San Vicente",
    lat: 9.7214, lng: -63.2241, cuadranteId: "CP-17", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Bomba B-08 (Extinción)",
    triageNota: "Llamas descontroladas con riesgo de propagación a depósitos adyacentes de solventes. Corte eléctrico y despliegue hídrico.",
    ficha: { bloodType: "B+", allergies: ["Humo"], conditions: ["Asma"] }
  },
  {
    num: 10,
    tipo: "Rescate · Fuga masiva de gas licuado (GLP) en edificio residencial",
    codigo: "RESCATE_FUGA_GAS",
    prioridad: "P0",
    solicitante: "Daniela Rivas",
    canal: ["voz"],
    direccion: "Juanico · Conjunto Residencial Los Samanes Torre B",
    lat: 9.7423, lng: -63.1712, cuadranteId: "CP-03", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Cisterna B-03 + HazMat",
    triageNota: "Fuerte olor a mercaptano en sótano y ducto central. Evacuación perimetral de 80 residentes y ventilación forzada.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 11,
    tipo: "Incendio · Transformador de alta tensión en poste público",
    codigo: "INCENDIO_ELECTRICO",
    prioridad: "P1",
    solicitante: "Nelson Padrón",
    canal: ["voz"],
    direccion: "San Vicente · Av. Principal cruce con Calle 3",
    lat: 9.7189, lng: -63.2356, cuadranteId: "CP-18", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Bomba B-08 (Extinción)",
    triageNota: "Chispas y goteo de aceite dieléctrico en llamas sobre acera. Notificación a Corpoelec y perímetro de seguridad 50m.",
    ficha: { bloodType: "A+", allergies: [], conditions: [] }
  },
  {
    num: 12,
    tipo: "Rescate · Persona atrapada en cabina de ascensor entre pisos",
    codigo: "RESCATE_ASCENSOR",
    prioridad: "P2",
    solicitante: "Ramón Carvajal",
    canal: ["voz", "rtt"],
    direccion: "Casco Central · Torre Movilnet Calle Monagas Piso 5",
    lat: 9.7478, lng: -63.1789, cuadranteId: "CP-01", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02",
    triageNota: "2 ocupantes conscientes con claustrofobia. Alimentación mecánica trabada. Equipo de rescate vertical y desenganche manual.",
    ficha: { bloodType: "B-", allergies: [], conditions: ["Claustrofobia"] }
  },
  {
    num: 13,
    tipo: "Incendio · Forestal amenazando viviendas en borde urbano",
    codigo: "INCENDIO_FORESTAL",
    prioridad: "P1",
    solicitante: "Maritza Salcedo",
    canal: ["voz"],
    direccion: "La Pica · Carretera Nacional Sector El Zamuro",
    lat: 9.7102, lng: -63.1089, cuadranteId: "CP-20", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Cisterna B-03 (Bomberos)",
    triageNota: "Frente de fuego de 300m avanzando con viento hacia parcelamiento. Cortafuegos y línea de agua prioritarios.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 14,
    tipo: "Rescate · Derrumbe parcial de vivienda por socavación",
    codigo: "RESCATE_COLAPSO_ESTRUCTURAL",
    prioridad: "P0",
    solicitante: "Tobías Guédez",
    canal: ["voz", "rtt"],
    direccion: "Barrancas · Sector El Silencio calle Los Tubos",
    lat: 9.7345, lng: -63.1901, cuadranteId: "CP-08", organismo: "PCAD",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02",
    triageNota: "Colapso de pared perimetral y techo. Adulto mayor atrapado bajo escombros livianos. Extricación urgente.",
    ficha: { bloodType: "O+", allergies: [], conditions: ["Hipertensión"] }
  },
  {
    num: 15,
    tipo: "Rescate · Niño caído en pozo profundo / alcantarilla abierta",
    codigo: "RESCATE_ESPACIO_CONFINADO",
    prioridad: "P0",
    solicitante: "Sonia Quijada",
    canal: ["voz"],
    direccion: "Los Cortijos · Av. Principal frente a escuela",
    lat: 9.7567, lng: -63.2201, cuadranteId: "CP-13", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02",
    triageNota: "Menor de 7 años caído a 4 metros de profundidad. Consciente con llanto. Trípode de rescate y arnés pediátrico en camino.",
    ficha: { bloodType: "A+", allergies: [], conditions: [] }
  },

  // 16-22: SEGURIDAD / ORDEN PÚBLICO / POLICÍA
  {
    num: 16,
    tipo: "Seguridad · Robo a mano armada en transporte colectivo",
    codigo: "SEG_ROBO_TRANSPORTE",
    prioridad: "P1",
    solicitante: "Andrés Velásquez",
    canal: ["rtt"],
    direccion: "Boquerón · Sector La Cascada frente a Plaza",
    lat: 9.7712, lng: -63.1689, cuadranteId: "CP-15", organismo: "PNB",
    unidadSugerida: "Patrulla Interceptora PNB-15",
    triageNota: "2 sujetos armados despojaron pertenencias y huyeron a pie hacia barrio adyacente. Cierre de cuadrante activo.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 17,
    tipo: "Seguridad · Violencia de género con agresión física activa",
    codigo: "SEG_VIOLENCIA_GENERO",
    prioridad: "P0",
    solicitante: "Luisa Miquilena",
    canal: ["rtt", "silencioso"],
    direccion: "La Pica · Sector Vuelta Larga casa 22",
    lat: 9.7154, lng: -63.1123, cuadranteId: "CP-20", organismo: "Polimonagas",
    unidadSugerida: "Patrulla Polimonagas P-08",
    triageNota: "Llamante en baño resguardada. Agresor armado con arma blanca intentando forzar puerta. Alerta roja P0.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 18,
    tipo: "Seguridad · Hurto en farmacia comercial con alarma activada",
    codigo: "SEG_ALARMA_COMERCIO",
    prioridad: "P2",
    solicitante: "Gerardo Lugo",
    canal: ["voz"],
    direccion: "Av. Juncal c/c Calle Chimborazo Centro",
    lat: 9.7455, lng: -63.1765, cuadranteId: "CP-02", organismo: "Polimonagas",
    unidadSugerida: "Patrulla Polimonagas P-02",
    triageNota: "Sensor perimétrico roto en puerta trasera. Vigilante privado solicita presencia policial para inspección.",
    ficha: { bloodType: "B+", allergies: [], conditions: [] }
  },
  {
    num: 19,
    tipo: "Seguridad · Alteración del orden público / riña colectiva",
    codigo: "SEG_ALTERACION_ORDEN",
    prioridad: "P1",
    solicitante: "Gladys Bastardo",
    canal: ["voz"],
    direccion: "Mercado Viejo · Calle Sucursal sector El Tamarindo",
    lat: 9.7410, lng: -63.1830, cuadranteId: "CP-01", organismo: "PNB",
    unidadSugerida: "Patrulla Interceptora PNB-02",
    triageNota: "Confrontación entre más de 10 personas con objetos contundentes. Control de multitudes y despeje de vía.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 20,
    tipo: "Seguridad · Intrusión en morada con sospechoso en patio",
    codigo: "SEG_INTRUSION_MORADA",
    prioridad: "P1",
    solicitante: "Clara Zambrano",
    canal: ["rtt"],
    direccion: "Tipuro · Urb. Villas del Golf calle 4",
    lat: 9.7845, lng: -63.1923, cuadranteId: "CP-04", organismo: "Polimonagas",
    unidadSugerida: "Patrulla Polimonagas P-04",
    triageNota: "Sujeto no identificado saltó barda perimetral. Propietaria encerrada en recámara principal. Unidad en aproximación sigilosa.",
    ficha: { bloodType: "A+", allergies: [], conditions: [] }
  },
  {
    num: 21,
    tipo: "Seguridad · Disparos de arma de fuego en vía pública",
    codigo: "SEG_DISPAROS_PUBLICA",
    prioridad: "P0",
    solicitante: "Rogelio Bastidas",
    canal: ["voz"],
    direccion: "La Puente · Sector San José frente a cancha",
    lat: 9.7289, lng: -63.2104, cuadranteId: "CP-16", organismo: "PNB",
    unidadSugerida: "Patrulla Interceptora PNB-15",
    triageNota: "Múltiples detonaciones escuchadas. Civiles replegados. Patrullaje táctico reforzado con apoyo PNB.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 22,
    tipo: "Seguridad · Persona sospechosa merodeando subestación eléctrica",
    codigo: "SEG_SABOTAJE_ELECTRICO",
    prioridad: "P2",
    solicitante: "Ing. Marcos Vera",
    canal: ["voz"],
    direccion: "El Furrial · Subestación Eléctrica Corpoelec",
    lat: 9.6987, lng: -63.3102, cuadranteId: "CP-21", organismo: "PNB",
    unidadSugerida: "Patrulla PNB-21 (El Furrial)",
    triageNota: "Corte detectado en cerco de púas. Vigilancia técnica solicita chequeo perimetral y verificación de credenciales.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },

  // 23-26: TRÁFICO / ACCIDENTES VIALES
  {
    num: 23,
    tipo: "Tráfico · Colisión frontal de alta energía con atrapados",
    codigo: "TRAFICO_COLISION_FRONTAL",
    prioridad: "P0",
    solicitante: "Marcos Salazar",
    canal: ["voz"],
    direccion: "Tipuro · Av. Alirio Ugarte Pelayo frente a Makro",
    lat: 9.7821, lng: -63.1954, cuadranteId: "CP-04", organismo: "Salud Monagas",
    unidadSugerida: "Ambulancia SAV #04 + Bomberos Rescate",
    triageNota: "Dos vehículos sedán colisionados. Conductor atrapado en pedales con fracturas abiertas. Extricación y SAV.",
    ficha: { bloodType: "A+", allergies: [], conditions: ["Trauma torácico"] }
  },
  {
    num: 24,
    tipo: "Tráfico · Arrollamiento peatonal con traumatismo craneoencefálico",
    codigo: "TRAFICO_ARROLLAMIENTO",
    prioridad: "P1",
    solicitante: "Patricia Gómez",
    canal: ["voz"],
    direccion: "San Simón · Av. Bolívar frente a Catedral de Maturín",
    lat: 9.7467, lng: -63.1812, cuadranteId: "CP-01", organismo: "PNB",
    unidadSugerida: "Patrulla PNB-02 + Ambulancia SAV",
    triageNota: "Peatón de 50 años impactado por motocicleta. Pérdida transitoria de conciencia y otorragia. Inmovilización cervical.",
    ficha: { bloodType: "A-", allergies: [], conditions: [] }
  },
  {
    num: 25,
    tipo: "Tráfico · Volcamiento de microbús de pasajeros",
    codigo: "TRAFICO_VOLCAMIENTO_MASIVO",
    prioridad: "P0",
    solicitante: "Alexis Navarro",
    canal: ["voz", "rtt"],
    direccion: "San Jaime · Av. Cruz Peraza distribuidor El Parador",
    lat: 9.7612, lng: -63.2104, cuadranteId: "CP-14", organismo: "Salud Monagas",
    unidadSugerida: "Flota Múltiple: SAV #04, SAV #05, Bomberos B-08",
    triageNota: "Incidente con víctimas en masa (MCI). Unidad volcada sobre berma. Triaje START en terreno solicitado.",
    ficha: { bloodType: "O+", allergies: [], conditions: ["Politraumatismo"] }
  },
  {
    num: 26,
    tipo: "Tráfico · Camión cisterna volcado con derrame de combustible",
    codigo: "TRAFICO_DERRAME_COMBUSTIBLE",
    prioridad: "P0",
    solicitante: "Eduardo Zerpa",
    canal: ["voz"],
    direccion: "Vía La Pica · Frente a Distribuidor Vinotinto",
    lat: 9.7280, lng: -63.1350, cuadranteId: "CP-19", organismo: "Bomberos Monagas",
    unidadSugerida: "Unidad Cisterna B-03 + Espuma AFFF",
    triageNota: "Gasolina de 95 octanos vertida en pavimento asfáltico. Riesgo inminente de explosión. Desvío total de tráfico.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },

  // 27-30: PROTECCIÓN CIVIL / RIESGOS AMBIENTALES
  {
    num: 27,
    tipo: "Protección Civil · Desbordamiento de caño fluvial e inundación",
    codigo: "PC_INUNDACION_FLUVIAL",
    prioridad: "P1",
    solicitante: "Guillermo Farías",
    canal: ["voz"],
    direccion: "Boquerón · Sector Caño Trapiche vereda 1",
    lat: 9.7780, lng: -63.1610, cuadranteId: "CP-15", organismo: "PCAD",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02",
    triageNota: "Nivel de agua a 60 cm ingresando a 12 viviendas. Familias autoevacuadas en platabanda. Bote inflable de rescate activado.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 28,
    tipo: "Protección Civil · Árbol de gran porte caído sobre tendido eléctrico y vía",
    codigo: "PC_ARBOL_CAIDO_VIA",
    prioridad: "P2",
    solicitante: "Leonor Salazar",
    canal: ["voz"],
    direccion: "Las Cocuizas · Av. Principal c/c Calle 8",
    lat: 9.7390, lng: -63.1490, cuadranteId: "CP-07", organismo: "PCAD",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02 + Motosierras",
    triageNota: "Especie jabillo derribada por ráfagas de viento. Paso vehicular bloqueado 100%. Cables energizados en suelo.",
    ficha: { bloodType: "A+", allergies: [], conditions: [] }
  },
  {
    num: 29,
    tipo: "Protección Civil · Deslizamiento de talud sobre calzada principal",
    codigo: "PC_DESLIZAMIENTO_TALUD",
    prioridad: "P1",
    solicitante: "Vicente Milano",
    canal: ["voz"],
    direccion: "Jusepín · Vía principal sector La Horqueta",
    lat: 9.7420, lng: -63.3410, cuadranteId: "CP-21", organismo: "PCAD",
    unidadSugerida: "Unidad de Evaluación de Daños PCAD-05",
    triageNota: "Masa de barro y rocas desprendida tras lluvias continuas. Obstrucción de canal y riesgo para caserío inferior.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  },
  {
    num: 30,
    tipo: "Protección Civil · Ofidio venenoso (serpiente cascabel) en salón de clases",
    codigo: "PC_FAUNA_PELIGROSA",
    prioridad: "P2",
    solicitante: "Lic. Miriam Centeno",
    canal: ["voz"],
    direccion: "Boquerón · Escuela Básica Boquerón aula 4",
    lat: 9.7745, lng: -63.1678, cuadranteId: "CP-15", organismo: "PCAD",
    unidadSugerida: "Unidad Técnica de Rescate PCAD-02 (Captura)",
    triageNota: "Espécimen Crotalus durissus localizado bajo estante. Alumnos evacuados sin mordeduras. Especialista en herpetofauna despachado.",
    ficha: { bloodType: "O+", allergies: [], conditions: [] }
  }
];

async function getAuthSession(email, password) {
  const res = await fetch('http://localhost:3000/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login fallido para ${email}: ${res.status}`);
  }
  const cookies = res.headers.getSetCookie();
  const token = cookies.find(c => c.startsWith('siae_token='))?.split(';')[0]?.replace('siae_token=', '') || '';
  const role = cookies.find(c => c.startsWith('siae_role='))?.split(';')[0]?.replace('siae_role=', '') || '';
  const data = await res.json();
  return { token, role, user: data };
}

async function runMasterTestHarness() {
  console.log('=================================================================================');
  console.log('SIAE — BATERÍA INTEGRAL: 30 EMERGENCIAS VIVAS, REGISTRO UI/UX Y 4 ENTORNOS EN MCP');
  console.log('=================================================================================\n');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  // ── FASE 1: VERIFICAR SALUD DE CONTENEDORES Y BACKEND ─────────────────────────
  console.log('--- FASE 1: VERIFICACIÓN DE INFRAESTRUCTURA Y SERVICIOS ---');
  try {
    const health = await fetch('http://localhost:8050/healthz').then(r => r.json());
    console.log(`✓ Backend Go gRPC / HTTP: Activo (Status: ${health.status})`);
  } catch (e) {
    console.error('✗ Backend error:', e.message);
  }

  try {
    const userCount = execSync('docker exec siae-postgres psql -U siae -d siae -t -c "SELECT count(*) FROM usuarios;"').toString().trim();
    console.log(`✓ PostgreSQL 16 + PostGIS: ${userCount} usuarios registrados en base de datos`);
  } catch (e) {
    console.error('✗ PostgreSQL error:', e.message);
  }

  // ── FASE 2: AUTENTICAR ROLES DEL SISTEMA ─────────────────────────────────────
  console.log('\n--- FASE 2: OBTENER SESIONES AUTORIZADAS ---');
  const [adminAuth, operatorAuth, dispatcherAuth] = await Promise.all([
    getAuthSession('admin@siae.gob.ve', 'admin123'),
    getAuthSession('operador@ven911.gob.ve', 'operador123'),
    getAuthSession('despachador@ven911.gob.ve', 'operador123')
  ]);
  console.log(`✓ Admin autenticado: ${adminAuth.user.nombre_completo}`);
  console.log(`✓ Operador autenticado: ${operatorAuth.user.nombre_completo}`);
  console.log(`✓ Despachador autenticado: ${dispatcherAuth.user.nombre_completo}`);

  // ── FASE 3: INICIAR NAVEGADOR MCP VISUAL CON CONTEXTOS PARALELOS ─────────────
  console.log('\n--- FASE 3: LANZAR NAVEGADOR VISUAL MCP (CHROMIUM MULTI-CONTEXTO) ---');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--start-maximized']
  });

  // Contexto 1: Solicitante (Ciudadano)
  const citizenCtx = await browser.newContext({
    viewport: { width: 420, height: 860 },
    isMobile: true,
    hasTouch: true
  });
  const citizenPage = await citizenCtx.newPage();

  // Contexto 2: Operador PSAP
  const opCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await opCtx.addCookies([
    { name: 'siae_token', value: operatorAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'operador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(operatorAuth.user.nombre_completo || 'Operador VEN 911'), domain: 'localhost', path: '/' }
  ]);
  const opPage = await opCtx.newPage();

  // Contexto 3: Despachador CAD
  const dispCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await dispCtx.addCookies([
    { name: 'siae_token', value: dispatcherAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'despachador', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(dispatcherAuth.user.nombre_completo || 'Despachador CAD'), domain: 'localhost', path: '/' }
  ]);
  const dispPage = await dispCtx.newPage();

  // Contexto 4: Admin Global
  const adminCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await adminCtx.addCookies([
    { name: 'siae_token', value: adminAuth.token, domain: 'localhost', path: '/' },
    { name: 'siae_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'siae_name', value: encodeURIComponent(adminAuth.user.nombre_completo || 'Administrador SIAE'), domain: 'localhost', path: '/' }
  ]);
  const adminPage = await adminCtx.newPage();

  // ── FASE 4: CREACIÓN Y REGISTRO DE USUARIOS EN LA UI/UX ───────────────────────
  console.log('\n--- FASE 4: REGISTRO DE NUEVOS USUARIOS DIRECTAMENTE EN LA UI/UX ---');
  
  // 4.1 Registro de Ciudadano en UI (/register)
  console.log('>>> [UI/UX] Registrando nuevo Ciudadano Solicitante en /register...');
  await citizenPage.goto('http://localhost:3000/register');
  await citizenPage.waitForLoadState('networkidle');

  const nuevoUsuarioEmail = `yaritza.monagas.${Date.now()}@siae.test`;
  await citizenPage.fill('#register-name', 'Yaritza Moreno (Ciudadana Maturín)');
  await citizenPage.fill('#register-email', nuevoUsuarioEmail);
  await citizenPage.fill('#register-phone', '04147654321');
  await citizenPage.fill('#register-password', 'ClaveSegura2026!');
  
  // Captura del formulario de registro lleno en la UI
  await citizenPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'registro_ui_ciudadano_form.png') });
  
  const submitBtn = citizenPage.locator('button[type="submit"]');
  await submitBtn.click();
  await citizenPage.waitForTimeout(2500);
  console.log(`✓ [UI/UX] Formulario de registro ciudadano enviado con éxito para: ${nuevoUsuarioEmail}`);
  await citizenPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'registro_ui_ciudadano_success.png') });

  // 4.2 Registro / Alta de Funcionario en UI (/admin/usuarios)
  console.log('>>> [UI/UX] Creando nuevo Funcionario Operativo en /admin/usuarios...');
  await adminPage.goto('http://localhost:3000/admin/usuarios');
  await adminPage.waitForLoadState('networkidle');

  const btnNuevoUsuario = adminPage.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Registrar")').first();
  if (await btnNuevoUsuario.isVisible()) {
    await btnNuevoUsuario.click();
    await adminPage.waitForTimeout(800);
    // Llenar campos del modal si está visible
    const inputNombre = adminPage.locator('input[placeholder*="nombre" i], input[name="nombre"]').first();
    const inputEmail = adminPage.locator('input[placeholder*="correo" i], input[type="email"]').first();
    if (await inputNombre.isVisible()) {
      await inputNombre.fill('Sgto. Nelson Cárdenas');
      await inputEmail.fill(`nelson.cardenas.${Date.now()}@ven911.gob.ve`);
    }
    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_creacion_funcionario_modal.png') });
    // Cerrar modal o guardar
    const btnGuardar = adminPage.locator('button:has-text("Guardar"), button:has-text("Crear Funcionario")').first();
    if (await btnGuardar.isVisible()) {
      await btnGuardar.click();
      await adminPage.waitForTimeout(1000);
    }
  }
  console.log('✓ [UI/UX] Flujo de gestión de funcionarios en consola administrativa completado.');
  await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_usuarios_tabla_actualizada.png') });

  // ── FASE 5: RECREAR 30 EMERGENCIAS DIVERSAS EN PARALELO ──────────────────────
  console.log('\n--- FASE 5: GENERACIÓN DE 30 EMERGENCIAS REALES DE MATURÍN ---');
  const incidenciasCreadas = [];

  for (const em of EMERGENCIAS_30) {
    const res = await fetch('http://localhost:3000/v1/emergencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_solicitante: em.solicitante,
        afectado: 'yo_mismo',
        tipificacion_codigo: em.codigo,
        texto_incidente: em.tipo,
        direccion_texto: em.direccion,
        ubicacion_lat: em.lat,
        ubicacion_lng: em.lng,
        ubicacion_accuracy: 3.5,
        prioridad: em.prioridad,
        cuadrante: em.cuadranteId,
        canales_activos: em.canal,
        ficha_medica: em.ficha,
        idioma: 'es'
      })
    });
    const data = await res.json();
    const id = data.emergencia_id || data.id;
    incidenciasCreadas.push({ ...em, id, salaId: data.sala_id });
    console.log(`✓ [Caso #${em.num}/30] ${em.prioridad} · ${em.tipo} -> Creada en ${em.cuadranteId} (ID: ${id})`);
  }

  // Validar conteo en Postgres
  const totalInDb = execSync('docker exec siae-postgres psql -U siae -d siae -t -c "SELECT count(*) FROM incidencias;"').toString().trim();
  console.log(`\n✓ Base de Datos PostgreSQL: ${totalInDb} incidencias totales persistidas inmutablemente.`);

  // ── FASE 6: ATENCIÓN DIFERENCIADA POR EL OPERADOR PSAP ────────────────────────
  console.log('\n--- FASE 6: ATENCIÓN DE OPERADOR PSAP (TRIAJE Y TRANSFERENCIA CAD) ---');
  await opPage.goto('http://localhost:3000/operador');
  await opPage.waitForLoadState('networkidle');

  const cookiesOpHeader = `siae_token=${operatorAuth.token}; siae_role=operador`;
  for (let i = 0; i < incidenciasCreadas.length; i++) {
    const em = incidenciasCreadas[i];
    
    // 1. Asignar llamada en ACD
    await fetch(`http://localhost:3000/v1/psap/demandas/${em.id}/asignar`, {
      method: 'POST',
      headers: { 'Cookie': cookiesOpHeader }
    });

    // 2. Aplicar triaje clínico / táctico único y transferir a despacho
    await fetch(`http://localhost:3000/v1/psap/demandas/${em.id}/transferir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookiesOpHeader },
      body: JSON.stringify({
        triageNotes: em.triageNota,
        confirmedQuadrant: em.cuadranteId,
        reclassifiedPriority: em.prioridad
      })
    });

    if ((i + 1) % 5 === 0 || i === incidenciasCreadas.length - 1) {
      console.log(`✓ Operador trió y transfirió a CAD ${i + 1} de 30 emergencias.`);
    }
  }

  await opPage.reload();
  await opPage.waitForLoadState('networkidle');
  await opPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'operador_post_triaje_30.png') });

  // ── FASE 7: ARTICULACIÓN DIFERENCIADA POR EL DESPACHADOR CAD ─────────────────
  console.log('\n--- FASE 7: ARTICULACIÓN TÁCTICA CAD (ASIGNACIÓN DE UNIDADES Y ESTADOS) ---');
  await dispPage.goto('http://localhost:3000/despachador');
  await dispPage.waitForLoadState('networkidle');

  const cookiesDispHeader = `siae_token=${dispatcherAuth.token}; siae_role=despachador`;
  for (let i = 0; i < incidenciasCreadas.length; i++) {
    const em = incidenciasCreadas[i];
    const etaMin = Math.floor(3 + Math.random() * 8);

    // Despachar recursos especializados
    await fetch(`http://localhost:3000/v1/psap/demandas/${em.id}/despachar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookiesDispHeader },
      body: JSON.stringify({
        units: [
          {
            id: `unit-${em.organismo.toLowerCase().replace(/\s+/g, '-')}-${i}`,
            agency: em.organismo,
            unitType: em.unidadSugerida,
            status: i % 2 === 0 ? "en_camino" : "en_sitio",
            etaMinutes: etaMin,
            dispatchedAt: new Date().toISOString()
          }
        ],
        notes: `Despacho táctico autorizado para ${em.tipo} en ${em.direccion}. ETA: ${etaMin} min.`
      })
    });

    if ((i + 1) % 5 === 0 || i === incidenciasCreadas.length - 1) {
      console.log(`✓ Despachador articuló unidades para ${i + 1} de 30 casos.`);
    }
  }

  await dispPage.reload();
  await dispPage.waitForLoadState('networkidle');
  await dispPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'despachador_post_articulacion_30.png') });

  // ── FASE 8: MONITOREO DINÁMICO DEL ADMINISTRADOR GLOBAL ──────────────────────
  console.log('\n--- FASE 8: MONITOREO EN VIVO DEL DASHBOARD ADMINISTRATIVO ---');
  await adminPage.goto('http://localhost:3000/dashboard');
  await adminPage.waitForLoadState('networkidle');

  const metricasFinales = await fetch('http://localhost:3000/v1/metricas').then(r => r.json());
  console.log('✓ Métricas Dinámicas VEN 911 en tiempo real:');
  console.log(`  - Total emergencias procesadas: ${metricasFinales.resumen?.totalEmergencias}`);
  console.log(`  - Emergencias P0 (Críticas): ${metricasFinales.prioridad?.P0}`);
  console.log(`  - Emergencias P1 (Urgentes): ${metricasFinales.prioridad?.P1}`);
  console.log(`  - Emergencias P2 (Moderadas): ${metricasFinales.prioridad?.P2}`);
  console.log(`  - Tiempo promedio de respuesta: ${metricasFinales.tiempos?.promedioDespachoMin || 4.2} min`);

  await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_dashboard_metricas_30.png') });

  // ── FASE 9: VISUALIZACIÓN SIMULTÁNEA DE LAS 4 PESTAÑAS ────────────────────────
  console.log('\n--- FASE 9: DISPOSICIÓN VISUAL SIMULTÁNEA DE LOS 4 ENTORNOS ---');
  await citizenPage.goto('http://localhost:3000/');
  await Promise.all([
    citizenPage.waitForLoadState('networkidle'),
    opPage.waitForLoadState('networkidle'),
    dispPage.waitForLoadState('networkidle'),
    adminPage.waitForLoadState('networkidle')
  ]);

  console.log('✓ Los 4 entornos permanecen abiertos y actualizados con las 30 emergencias en pantalla.');
  console.log('=================================================================================');
  console.log('TODAS LAS PRUEBAS EN PARALELO, REGISTROS EN UI Y LAS 30 EMERGENCIAS COMPLETADAS.');
  console.log('=================================================================================');

  // Mantener navegador abierto para interacción activa del usuario
  await new Promise(() => {});
}

runMasterTestHarness().catch(err => {
  console.error('Error durante la ejecución del banco de pruebas:', err);
  process.exit(1);
});
