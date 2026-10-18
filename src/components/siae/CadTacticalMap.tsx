"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Radio,
  Layers,
  Ambulance,
  Shield,
  Flame,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Activity,
  AlertCircle,
} from "lucide-react";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";

export interface TacticalMapUnit {
  id: string;
  code: string;
  type: "ambulancia" | "patrulla" | "bomberos";
  name: string;
  lat: number;
  lng: number;
  status: "disponible" | "en_ruta" | "en_sitio";
  etaMinutes?: number;
  speedKmh?: number;
}

interface CadTacticalMapProps {
  emergencyLat?: number;
  emergencyLng?: number;
  emergencyTitle?: string;
  priority?: "P0" | "P1" | "P2" | "P3";
  cuadranteId?: string;
  dispatchedUnits?: TacticalMapUnit[];
  height?: number | string;
  interactive?: boolean;
}

const CUADRANTES_MATURIN = [
  { id: "CP-01", name: "Casco Central / Plaza Bolívar", lat: 9.7455, lng: -63.1812, organ: "PNB", color: "#3b82f6" },
  { id: "CP-05", name: "Los Guaritos / UDO", lat: 9.7185, lng: -63.1994, organ: "Polimonagas", color: "#10b981" },
  { id: "CP-09", name: "Las Cocuizas / Aeropuerto", lat: 9.7495, lng: -63.1550, organ: "GNB", color: "#8b5cf6" },
  { id: "CP-14", name: "Alto de Los Godos", lat: 9.7310, lng: -63.2050, organ: "Polimaturín", color: "#f59e0b" },
  { id: "CP-21", name: "Boquerón Norte / Tipuro", lat: 9.7750, lng: -63.1920, organ: "Polimonagas", color: "#ef4444" },
];

export function CadTacticalMap({
  emergencyLat = 9.7489,
  emergencyLng = -63.1798,
  emergencyTitle = "Incidente Reportado VEN 911",
  priority = "P0",
  cuadranteId = "CP-21",
  dispatchedUnits = [],
  height = 360,
  interactive = true,
}: CadTacticalMapProps) {
  const [zoom, setZoom] = useState(14);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [liveMovingOffset, setLiveMovingOffset] = useState(0);

  // Simulación AVL en tiempo real (desplazamiento suave de patrullas/ambulancias)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveMovingOffset((prev) => (prev + 0.0001) % 0.002);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleZoomIn = () => {
    triggerHapticFeedback("tap");
    setZoom((z) => Math.min(18, z + 1));
  };

  const handleZoomOut = () => {
    triggerHapticFeedback("tap");
    setZoom((z) => Math.max(10, z - 1));
  };

  const handleRecenter = () => {
    triggerHapticFeedback("tap");
    setCenterOffset({ x: 0, y: 0 });
    setSelectedPin(null);
  };

  // Conversión de coordenadas geo a píxeles cartesianos relativos SVG
  const centerLat = emergencyLat;
  const centerLng = emergencyLng;

  const geoToSvg = (lat: number, lng: number) => {
    const scale = Math.pow(2, zoom - 10) * 1200;
    const x = 400 + (lng - centerLng) * scale + centerOffset.x;
    const y = 200 - (lat - centerLat) * scale + centerOffset.y;
    return { x, y };
  };

  const emergencyPos = geoToSvg(emergencyLat, emergencyLng);

  // Unidades AVL por defecto si no se pasan
  const activeUnits: TacticalMapUnit[] = dispatchedUnits.length > 0 ? dispatchedUnits : [
    {
      id: "u-amb-04",
      code: "AMB-04",
      type: "ambulancia",
      name: "Salud Monagas - Ambulancia Soporte Avanzado",
      lat: emergencyLat - 0.003 + liveMovingOffset,
      lng: emergencyLng - 0.004 + liveMovingOffset * 1.5,
      status: "en_ruta",
      etaMinutes: 4,
      speedKmh: 52,
    },
    {
      id: "u-pat-112",
      code: "PAT-112",
      type: "patrulla",
      name: "PNB Cuadrante Móvil",
      lat: emergencyLat + 0.002 - liveMovingOffset * 0.8,
      lng: emergencyLng + 0.003 - liveMovingOffset,
      status: "en_ruta",
      etaMinutes: 2,
      speedKmh: 45,
    },
  ];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-300 dark:border-slate-800 bg-slate-950 text-white shadow-2xl select-none"
      style={{ height }}
      aria-label="Mapa táctico CAD en tiempo real"
    >
      {/* HUD Superior: Telemetría y Estatus GPS */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-black tracking-wider text-emerald-400 uppercase font-mono">
            CAD GIS · MATURÍN AVL
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {emergencyLat.toFixed(4)}° N, {emergencyLng.toFixed(4)}° W
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-bold font-mono text-cyan-400">
            Cuadrante: <span className="text-white">{cuadranteId}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-700 text-[11px] font-black font-mono text-rose-300">
            {priority}
          </div>
        </div>
      </div>

      {/* Controles de Navegación del Mapa (Zoom / Recenter) */}
      {interactive && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700 text-white transition cursor-pointer"
            title="Acercar mapa"
            aria-label="Acercar mapa"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700 text-white transition cursor-pointer"
            title="Alejar mapa"
            aria-label="Alejar mapa"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 border border-sky-400 text-white transition cursor-pointer shadow-lg"
            title="Centrar en emergencia"
            aria-label="Centrar en emergencia"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SVG Canvas Interactivo */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          setIsPanning(true);
          setPanStart({ x: e.clientX - centerOffset.x, y: e.clientY - centerOffset.y });
        }}
        onMouseMove={(e) => {
          if (!isPanning) return;
          setCenterOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
      >
        <defs>
          {/* Rejilla de coordenadas táctica */}
          <pattern id="cad-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.5" fill="#334155" />
          </pattern>

          {/* Gradiente radial de la emergencia */}
          <radialGradient id="emergency-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fondo del mapa y rejilla */}
        <rect width="100%" height="100%" fill="#090d16" />
        <rect width="100%" height="100%" fill="url(#cad-grid)" />

        {/* Polígonos y Áreas de Cuadrantes de Paz */}
        {CUADRANTES_MATURIN.map((cp) => {
          const pos = geoToSvg(cp.lat, cp.lng);
          const isCurrent = cp.id === cuadranteId;
          return (
            <g key={cp.id} opacity={isCurrent ? 1 : 0.6}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isCurrent ? 55 : 35}
                fill={cp.color}
                fillOpacity={isCurrent ? 0.15 : 0.05}
                stroke={cp.color}
                strokeWidth={isCurrent ? 2 : 1}
                strokeDasharray={isCurrent ? "none" : "3,3"}
              />
              <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor="middle"
                fill={cp.color}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {cp.id}
              </text>
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontFamily="sans-serif"
              >
                {cp.organ}
              </text>
            </g>
          );
        })}

        {/* Vector de trayectoria entre ambulancia y emergencia */}
        {activeUnits.map((u) => {
          const uPos = geoToSvg(u.lat, u.lng);
          return (
            <g key={`path-${u.id}`}>
              <line
                x1={uPos.x}
                y1={uPos.y}
                x2={emergencyPos.x}
                y2={emergencyPos.y}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />
              {/* Animación de desplazamiento hacia el punto */}
              <circle
                cx={(uPos.x + emergencyPos.x) / 2}
                cy={(uPos.y + emergencyPos.y) / 2}
                r="3"
                fill="#22d3ee"
                className="animate-ping"
              />
            </g>
          );
        })}

        {/* Marcador de Emergencia (Punto de Auxilio) */}
        <g transform={`translate(${emergencyPos.x}, ${emergencyPos.y})`}>
          {/* Ondas radiales de urgencia */}
          <circle cx="0" cy="0" r="32" fill="url(#emergency-pulse)" className="animate-ping" />
          <circle cx="0" cy="0" r="14" fill="#ef4444" fillOpacity="0.4" />
          <circle cx="0" cy="0" r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />

          {/* Etiqueta flotante del incidente */}
          <g transform="translate(0, -22)">
            <rect
              x="-60"
              y="-14"
              width="120"
              height="20"
              rx="6"
              fill="#0f172a"
              stroke="#ef4444"
              strokeWidth="1.2"
              fillOpacity="0.95"
            />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              EMERGENCIA {priority}
            </text>
          </g>
        </g>

        {/* Marcadores AVL de Flotas en Tiempo Real */}
        {activeUnits.map((unit) => {
          const uPos = geoToSvg(unit.lat, unit.lng);
          const isSelected = selectedPin === unit.id;
          return (
            <g
              key={unit.id}
              transform={`translate(${uPos.x}, ${uPos.y})`}
              className="cursor-pointer"
              onClick={() => {
                triggerHapticFeedback("tap");
                setSelectedPin(unit.id);
              }}
            >
              {/* Aura de unidad */}
              <circle
                cx="0"
                cy="0"
                r="12"
                fill={unit.type === "ambulancia" ? "#10b981" : "#3b82f6"}
                fillOpacity="0.3"
              />
              <circle
                cx="0"
                cy="0"
                r="7"
                fill={unit.type === "ambulancia" ? "#059669" : "#2563eb"}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Rótulo de la unidad */}
              <g transform="translate(0, 16)">
                <rect
                  x="-35"
                  y="-10"
                  width="70"
                  height="16"
                  rx="4"
                  fill="#020617"
                  stroke={unit.type === "ambulancia" ? "#10b981" : "#3b82f6"}
                  strokeWidth="1"
                  fillOpacity="0.95"
                />
                <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                  {unit.code} ({unit.etaMinutes}m)
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Detalle flotante de la unidad seleccionada */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 z-20 max-w-xs p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-1.5 animate-in fade-in duration-150">
          {(() => {
            const u = activeUnits.find((unit) => unit.id === selectedPin);
            if (!u) return null;
            return (
              <>
                <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1">
                  <span className="text-emerald-400 font-mono">{u.code}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{u.type}</span>
                </div>
                <p className="text-white font-medium text-[11px]">{u.name}</p>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 pt-1">
                  <div>Velocidad: <span className="text-white">{u.speedKmh} km/h</span></div>
                  <div>ETA: <span className="text-emerald-400 font-bold">{u.etaMinutes} min</span></div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
