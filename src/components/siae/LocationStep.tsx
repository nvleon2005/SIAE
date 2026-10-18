"use client";

import { useEffect, useState } from "react";
import { MapPicker } from "@/src/components/siae/MapPicker";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useGeolocation } from "@/src/modules/geo/use-geolocation";
import { useRouter } from "next/navigation";

export function LocationStep() {
  const router = useRouter();
  const { result, loading, error } = useGeolocation();
  const setUbicacion = useEmergency((state) => state.setUbicacion);
  const [manualLocation, setManualLocation] = useState("");
  const [mapMode, setMapMode] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOnMap, setSelectedOnMap] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      const nextCoords = { lat: result.lat, lng: result.lng };
      const updateLocation = () => {
        setMapCoords(nextCoords);
        setSelectedOnMap(false);
      };
      window.setTimeout(updateLocation, 0);
    }
  }, [result]);

  const handleSaveAndContinue = () => {
    const safeCoords = mapCoords ?? result;
    if (!safeCoords) {
      setLocationError("Confirma una ubicación GPS o selecciona un punto en el mapa antes de continuar.");
      return;
    }
    const nextLocation: Parameters<typeof setUbicacion>[0] = {
      lat: safeCoords.lat,
      lng: safeCoords.lng,
      ...(!selectedOnMap && result?.accuracy !== undefined ? { accuracyM: result.accuracy } : {}),
      ...(manualLocation.trim() ? { addressText: manualLocation.trim() } : {}),
      source: selectedOnMap ? "manual" : result?.source ?? "manual",
    };

    setUbicacion(nextLocation);

    router.push("/confirmar");
  };

  const showTextInput = Boolean(result) || mapMode;

  return (
    <main className="tipify-page" aria-live="polite">
      <div className="tipify-shell">
        <button type="button" className="back-button" aria-label="Volver">
          ←
        </button>

        <h1 className="tipify-title">¿Dónde estás?</h1>
        <p className="tipify-subtitle">Confirma la ubicación de la emergencia y sigue con la ayuda.</p>

        {loading ? (
          <div className="location-status" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Obteniendo tu ubicación...</p>
          </div>
        ) : null}

        {!loading && result ? (
          <div className="location-card" role="status" aria-live="polite">
            <MapPicker
              initialLat={mapCoords?.lat ?? result.lat}
              initialLng={mapCoords?.lng ?? result.lng}
              onChange={(lat, lng) => {
                setMapCoords({ lat, lng });
                setSelectedOnMap(true);
                setLocationError(null);
              }}
            />
            <p className="location-coordinates">📍 {mapCoords?.lat.toFixed(4) ?? result.lat.toFixed(4)}, {mapCoords?.lng.toFixed(4) ?? result.lng.toFixed(4)}</p>
            <p className="location-detail">Precisión aproximada: ±{result.accuracy} m</p>
            <button type="button" className="secondary-button" onClick={() => setMapMode(true)}>
              Ajustar ubicación en el mapa
            </button>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="warning-banner" role="alert">
            No fue posible obtener tu ubicación. Activa el GPS para continuar.
          </div>
        ) : null}

        {showTextInput ? (
          <div className="manual-location">
            <label className="field-label" htmlFor="manual-address">
              Referencia adicional (opcional)
            </label>
            <input
              id="manual-address"
              className="text-input"
              type="text"
              value={manualLocation}
              onChange={(event) => setManualLocation(event.target.value)}
              placeholder="Indicaciones para encontrar el lugar"
            />
          </div>
        ) : null}

        {locationError ? <p role="alert" className="warning-banner">{locationError}</p> : null}
        <button type="button" className="primary-button" aria-label="Continuar" onClick={handleSaveAndContinue}>
          Continuar
        </button>
      </div>
    </main>
  );
}
