/**
 * SIAE — Catálogo Territorial Oficial de Cuadrantes de Paz
 * Jurisdicción: Municipio Maturín, Estado Monagas (VEN 911 Maturín)
 * Base Legal: Gran Misión Cuadrantes de Paz / Art. 81 CRBV
 */

export type OrganismoSeguridad =
  | "Policía Nacional Bolivariana (PNB)"
  | "PoliMonagas (Policía del Estado Monagas)"
  | "Guardia Nacional Bolivariana (GNB)"
  | "Cuerpo de Bomberos del Estado Monagas"
  | "Protección Civil y Administración de Desastres (PC)";

export interface CuadranteDePaz {
  id: string; // ej: "CP-01"
  numero: number; // ej: 1
  nombre: string;
  parroquia: string;
  sectorPrincipal: string;
  sectoresAbarcados: string[];
  organismoResponsable: OrganismoSeguridad;
  organismoSiglas: string;
  telefonoPatrulla: string;
  coordsReferencia: {
    lat: number;
    lng: number;
  };
  descripcionRuta?: string;
}

/**
 * Catálogo maestro oficial de Cuadrantes de Paz de Maturín, Edo. Monagas
 */
export const CUADRANTES_MATURIN: CuadranteDePaz[] = [
  {
    id: "CP-01",
    numero: 1,
    nombre: "Cuadrante de Paz N° 1 · Casco Central",
    parroquia: "San Simón",
    sectorPrincipal: "Casco Central",
    sectoresAbarcados: [
      "Av. Bolívar",
      "Av. Bicentenario",
      "Plaza Bolívar",
      "Paseo Bolívar",
      "Catedral de Maturín",
      "Calle Monagas",
      "Calle Sucre",
    ],
    organismoResponsable: "Policía Nacional Bolivariana (PNB)",
    organismoSiglas: "PNB",
    telefonoPatrulla: "+58 416-6912301",
    coordsReferencia: { lat: 9.7489, lng: -63.1798 },
    descripcionRuta: "Eje Central Av. Bolívar entre Av. Bicentenario y Calle Azcúe",
  },
  {
    id: "CP-02",
    numero: 2,
    nombre: "Cuadrante de Paz N° 2 · Mercado Viejo y Terminal",
    parroquia: "San Simón",
    sectorPrincipal: "Mercado Viejo",
    sectoresAbarcados: [
      "Mercado Municipal Viejo",
      "Av. Miranda",
      "Terminal Interurbano",
      "Calle Chimborazo",
      "Sector El Paraíso",
    ],
    organismoResponsable: "PoliMonagas (Policía del Estado Monagas)",
    organismoSiglas: "PoliMonagas",
    telefonoPatrulla: "+58 416-6912302",
    coordsReferencia: { lat: 9.7425, lng: -63.1852 },
    descripcionRuta: "Perímetro comercial Mercado Municipal hacia Terminal",
  },
  {
    id: "CP-03",
    numero: 3,
    nombre: "Cuadrante de Paz N° 3 · La Manga y Alberto Ravell",
    parroquia: "San Simón",
    sectorPrincipal: "La Manga",
    sectoresAbarcados: [
      "Sector La Manga",
      "Alberto Ravell",
      "Av. Orinoco",
      "Paseo San Simón",
    ],
    organismoResponsable: "Policía Nacional Bolivariana (PNB)",
    organismoSiglas: "PNB",
    telefonoPatrulla: "+58 416-6912303",
    coordsReferencia: { lat: 9.7541, lng: -63.1724 },
  },
  {
    id: "CP-04",
    numero: 4,
    nombre: "Cuadrante de Paz N° 4 · Tipuro Norte",
    parroquia: "Boquerón",
    sectorPrincipal: "Tipuro",
    sectoresAbarcados: [
      "Av. Alirio Ugarte Pelayo",
      "Urb. Palma Real",
      "Tipuro I y II",
      "CC Petroriente",
      "Zona Norte Maturín",
    ],
    organismoResponsable: "PoliMonagas (Policía del Estado Monagas)",
    organismoSiglas: "PoliMonagas",
    telefonoPatrulla: "+58 416-6912304",
    coordsReferencia: { lat: 9.7821, lng: -63.1954 },
    descripcionRuta: "Corredor vial Av. Alirio Ugarte Pelayo hasta Distribuidor San Jaime",
  },
  {
    id: "CP-05",
    numero: 5,
    nombre: "Cuadrante de Paz N° 5 · Boquerón y Costo Abajo",
    parroquia: "Boquerón",
    sectorPrincipal: "Boquerón Centro",
    sectoresAbarcados: [
      "Boquerón Centro",
      "El Costo",
      "La Cascada Norte",
      "San Jaime",
    ],
    organismoResponsable: "Guardia Nacional Bolivariana (GNB)",
    organismoSiglas: "GNB",
    telefonoPatrulla: "+58 416-6912305",
    coordsReferencia: { lat: 9.7952, lng: -63.1812 },
  },
  {
    id: "CP-08",
    numero: 8,
    nombre: "Cuadrante de Paz N° 8 · Los Godos y Los Guaritos",
    parroquia: "Alto de Los Godos",
    sectorPrincipal: "Los Guaritos",
    sectoresAbarcados: [
      "Los Guaritos I, II, III, IV",
      "UDO Campus Los Guaritos",
      "Av. Morichal",
      "Sector La Muralla",
    ],
    organismoResponsable: "PoliMonagas (Policía del Estado Monagas)",
    organismoSiglas: "PoliMonagas",
    telefonoPatrulla: "+58 416-6912308",
    coordsReferencia: { lat: 9.7312, lng: -63.2014 },
    descripcionRuta: "Eje universitario UDO - Eje Residencial Los Guaritos",
  },
  {
    id: "CP-09",
    numero: 9,
    nombre: "Cuadrante de Paz N° 9 · La Puente y El Rosillo",
    parroquia: "Alto de Los Godos",
    sectorPrincipal: "La Puente",
    sectoresAbarcados: [
      "Sector La Puente",
      "El Rosillo",
      "Viento Colao",
      "Fundi-Agua",
    ],
    organismoResponsable: "Policía Nacional Bolivariana (PNB)",
    organismoSiglas: "PNB",
    telefonoPatrulla: "+58 416-6912309",
    coordsReferencia: { lat: 9.7205, lng: -63.2158 },
  },
  {
    id: "CP-12",
    numero: 12,
    nombre: "Cuadrante de Paz N° 12 · Las Cocuizas y Aeropuerto",
    parroquia: "Las Cocuizas",
    sectorPrincipal: "Las Cocuizas",
    sectoresAbarcados: [
      "Aeropuerto Int. José Tadeo Monagas",
      "Sector Las Cocuizas",
      "El Silencio",
      "Av. José Tadeo Monagas",
      "La Pica enlace",
    ],
    organismoResponsable: "Policía Nacional Bolivariana (PNB)",
    organismoSiglas: "PNB",
    telefonoPatrulla: "+58 416-6912312",
    coordsReferencia: { lat: 9.7495, lng: -63.1524 },
    descripcionRuta: "Perímetro aeroportuario y corredor Av. José Tadeo Monagas",
  },
  {
    id: "CP-14",
    numero: 14,
    nombre: "Cuadrante de Paz N° 14 · Santa Cruz y Zona Industrial",
    parroquia: "Santa Cruz",
    sectorPrincipal: "Zona Industrial",
    sectoresAbarcados: [
      "Zona Industrial de Maturín",
      "Santa Cruz Centro",
      "Fundemos",
      "Av. Bella Vista oeste",
    ],
    organismoResponsable: "Guardia Nacional Bolivariana (GNB)",
    organismoSiglas: "GNB",
    telefonoPatrulla: "+58 416-6912314",
    coordsReferencia: { lat: 9.7289, lng: -63.2385 },
  },
  {
    id: "CP-16",
    numero: 16,
    nombre: "Cuadrante de Paz N° 16 · San Vicente",
    parroquia: "San Vicente",
    sectorPrincipal: "San Vicente Centro",
    sectoresAbarcados: [
      "Pueblo de San Vicente",
      "Vía La Toscana",
      "Sector Corocito",
    ],
    organismoResponsable: "PoliMonagas (Policía del Estado Monagas)",
    organismoSiglas: "PoliMonagas",
    telefonoPatrulla: "+58 416-6912316",
    coordsReferencia: { lat: 9.7712, lng: -63.2654 },
  },
  {
    id: "CP-20",
    numero: 20,
    nombre: "Cuadrante de Paz N° 20 · La Pica y Corredor Rural",
    parroquia: "La Pica",
    sectorPrincipal: "La Pica",
    sectoresAbarcados: [
      "Población La Pica",
      "Sector Laguna Grande",
      "Vía El Zamuro",
    ],
    organismoResponsable: "Guardia Nacional Bolivariana (GNB)",
    organismoSiglas: "GNB",
    telefonoPatrulla: "+58 416-6912320",
    coordsReferencia: { lat: 9.7684, lng: -63.0945 },
  },
];

/**
 * Obtener la lista completa de Cuadrantes de Paz
 */
export function getCuadrantesList(): CuadranteDePaz[] {
  return CUADRANTES_MATURIN;
}

/**
 * Obtener un Cuadrante de Paz por su identificador único (ej: "CP-12" o 12)
 */
export function getCuadranteById(idOrNumber: string | number): CuadranteDePaz | undefined {
  if (typeof idOrNumber === "number") {
    return CUADRANTES_MATURIN.find((c) => c.numero === idOrNumber);
  }
  const clean = idOrNumber.trim().toUpperCase();
  return (
    CUADRANTES_MATURIN.find((c) => c.id.toUpperCase() === clean) ||
    CUADRANTES_MATURIN.find((c) => String(c.numero) === clean.replace(/[^0-9]/g, "")) ||
    CUADRANTES_MATURIN.find((c) => c.nombre.toUpperCase().includes(clean))
  );
}

/**
 * Resolver el Cuadrante de Paz más apropiado a partir del texto de ubicación o coordenadas
 */
export function resolveCuadranteByLocation(
  locationText?: string,
  coords?: { lat: number; lng: number }
): CuadranteDePaz {
  if (locationText) {
    const text = locationText.toLowerCase();

    // Verificación por coincidencia de palabras clave territoriales
    if (text.includes("tipuro") || text.includes("palma real") || text.includes("ugarte pelayo")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-04")!;
    }
    if (text.includes("boquerón") || text.includes("boqueron") || text.includes("costo")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-05")!;
    }
    if (text.includes("cocuiza") || text.includes("aeropuerto") || text.includes("el silencio")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-12")!;
    }
    if (text.includes("guarito") || text.includes("godo") || text.includes("morichal") || text.includes("udo")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-08")!;
    }
    if (text.includes("puente") || text.includes("rosillo")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-09")!;
    }
    if (text.includes("mercado") || text.includes("terminal") || text.includes("miranda")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-02")!;
    }
    if (text.includes("santa cruz") || text.includes("industrial") || text.includes("fundemos")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-14")!;
    }
    if (text.includes("san vicente")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-16")!;
    }
    if (text.includes("la pica") || text.includes("laguna grande")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-20")!;
    }
    if (text.includes("manga") || text.includes("ravell")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-03")!;
    }
    if (text.includes("centro") || text.includes("bolívar") || text.includes("bolivar") || text.includes("bicentenario")) {
      return CUADRANTES_MATURIN.find((c) => c.id === "CP-01")!;
    }

    // Coincidencia con nombres de cuadrante si vienen en el texto (ej: "Cuadrante 12", "CP-04")
    const match = text.match(/(?:cuadrante\s*(?:de\s*paz)?\s*(?:n[°o.]?)?|cp-?)\s*([0-9]{1,2})/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      const found = CUADRANTES_MATURIN.find((c) => c.numero === num);
      if (found) return found;
    }
  }

  // Búsqueda por proximidad geográfica si hay coordenadas
  if (coords && coords.lat && coords.lng) {
    let best = CUADRANTES_MATURIN[0];
    let minDistanceSq = Number.MAX_VALUE;

    for (const c of CUADRANTES_MATURIN) {
      const dLat = coords.lat - c.coordsReferencia.lat;
      const dLng = coords.lng - c.coordsReferencia.lng;
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        best = c;
      }
    }
    return best;
  }

  // Por defecto: Casco Central
  return CUADRANTES_MATURIN[0];
}
