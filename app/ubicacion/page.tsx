"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, MapPin, Navigation } from "lucide-react";
import { MapPicker } from "@/src/components/siae/MapPicker";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useGeolocation } from "@/src/modules/geo/use-geolocation";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { readProfileFromDb, type AddressRecord } from "@/src/lib/profile-db";

type Coordinates = { lat: number; lng: number };

function isValidCoordinates(value: Coordinates | null): value is Coordinates {
  return Boolean(
    value &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    value.lat >= -90 &&
    value.lat <= 90 &&
    value.lng >= -180 &&
    value.lng <= 180
  );
}

export default function UbicacionPage() {
  const router = useRouter();
  const { result, loading, error: geolocationError } = useGeolocation();
  const setUbicacion = useEmergency((state) => state.setUbicacion);
  const setFlowStatus = useEmergency((state) => state.setFlowStatus);
  const [savedAddresses, setSavedAddresses] = useState<AddressRecord[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [reference, setReference] = useState("");
  const [source, setSource] = useState<"gps" | "fallback" | "saved" | "manual">("manual");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setFlowStatus("location");
    readProfileFromDb()
      .then((profile) => setSavedAddresses(profile?.addresses ?? []))
      .catch((error: unknown) => {
        setLocationError(error instanceof Error ? error.message : "No se pudieron cargar tus direcciones guardadas.");
      });
  }, [setFlowStatus]);

  useEffect(() => {
    if (!result || locationInitialized) return;
    const nextCoordinates = { lat: result.lat, lng: result.lng };
    setCoordinates(nextCoordinates);
    setLocationInitialized(true);
    setManualLatitude(String(result.lat));
    setManualLongitude(String(result.lng));
    setSource(result.source === "fallback" ? "fallback" : "gps");
  }, [result, locationInitialized]);

  const updateManualCoordinates = (latitude: string, longitude: string) => {
    setLocationInitialized(true);
    setManualLatitude(latitude);
    setManualLongitude(longitude);
    setSelectedAddressId(null);

    if (!latitude.trim() || !longitude.trim()) {
      setCoordinates(null);
      setSource("manual");
      return;
    }

    const nextCoordinates = { lat: Number(latitude), lng: Number(longitude) };
    if (isValidCoordinates(nextCoordinates)) {
      setCoordinates(nextCoordinates);
      setSource("manual");
      setLocationError(null);
    } else {
      setCoordinates(null);
      setLocationError("Introduce latitud entre -90 y 90 y longitud entre -180 y 180.");
    }
  };

  const selectSavedAddress = (address: AddressRecord) => {
    setLocationInitialized(true);
    triggerHapticFeedback("tap");
    setSelectedAddressId(address.id);
    setReference(address.referencePoint || address.value);
    if (typeof address.lat === "number" && typeof address.lng === "number") {
      const nextCoordinates = { lat: address.lat, lng: address.lng };
      if (isValidCoordinates(nextCoordinates)) {
        setCoordinates(nextCoordinates);
        setManualLatitude(String(address.lat));
        setManualLongitude(String(address.lng));
        setSource("saved");
        setLocationError(null);
        return;
      }
    }
    setCoordinates(null);
    setLocationError("Esta dirección no tiene coordenadas guardadas. Selecciona el punto en el mapa o introduce sus coordenadas.");
  };

  const handleSaveAndContinue = () => {
    if (!isValidCoordinates(coordinates)) {
      setLocationError("Confirma una posición GPS, una dirección guardada con coordenadas o un punto del mapa.");
      return;
    }

    const nextLocation: Parameters<typeof setUbicacion>[0] = {
      ...coordinates,
      ...(source === "gps" || source === "fallback" ? { accuracyM: result?.accuracy } : {}),
      ...(reference.trim() ? { addressText: reference.trim() } : {}),
      source,
      capturedAt: source === "gps" && result ? result.capturedAt : new Date().toISOString(),
    };
    setUbicacion(nextLocation);
    router.push("/confirmar");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Volver"
          onClick={() => router.push("/tipificar")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle showLabel={false} />
          <span className="rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200">
            Paso 2: Ubicación
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-4 pb-28 pt-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Ubicación de la emergencia
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Confirma el punto exacto. No se enviará una ubicación de ejemplo.
          </p>
        </div>

        {loading ? (
          <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-100">
            Obteniendo tu ubicación…
          </p>
        ) : null}

        {geolocationError ? (
          <div role="alert" className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{geolocationError}</p>
          </div>
        ) : null}

        {result && !geolocationError ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            <p className="flex items-center gap-2 font-semibold">
              <Navigation className="h-4 w-4" />
              Posición obtenida desde el dispositivo
            </p>
            <p className="mt-1 font-mono text-xs">
              {result.lat.toFixed(6)}, {result.lng.toFixed(6)} · precisión ±{Math.round(result.accuracy)} m
            </p>
          </div>
        ) : null}

        {savedAddresses.length ? (
          <section aria-labelledby="saved-addresses-title" className="space-y-2">
            <h2 id="saved-addresses-title" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Direcciones guardadas en tu perfil
            </h2>
            <div className="flex flex-wrap gap-2">
              {savedAddresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  aria-pressed={selectedAddressId === address.id}
                  onClick={() => selectSavedAddress(address)}
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-800 hover:border-sky-500 dark:border-slate-700 dark:text-slate-200"
                >
                  <MapPin aria-hidden="true" className="mr-1 inline h-4 w-4" />
                  {address.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="coordinates-title" className="grid gap-3 sm:grid-cols-2">
          <h2 id="coordinates-title" className="sr-only">Coordenadas manuales</h2>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Latitud
            <input
              inputMode="decimal"
              value={manualLatitude}
              onChange={(event) => updateManualCoordinates(event.target.value, manualLongitude)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
              placeholder="-90 a 90"
            />
          </label>
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Longitud
            <input
              inputMode="decimal"
              value={manualLongitude}
              onChange={(event) => updateManualCoordinates(manualLatitude, event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
              placeholder="-180 a 180"
            />
          </label>
        </section>

        {isValidCoordinates(coordinates) ? (
          <MapPicker
            initialLat={coordinates.lat}
            initialLng={coordinates.lng}
            onChange={(lat, lng) => {
              setCoordinates({ lat, lng });
              setManualLatitude(String(lat));
              setManualLongitude(String(lng));
              setSelectedAddressId(null);
              setSource("manual");
              setLocationError(null);
            }}
          />
        ) : null}

        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          Indicaciones adicionales (opcional)
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Piso, entrada, punto de referencia"
          />
        </label>

        {locationError ? <p role="alert" className="text-sm text-red-700 dark:text-red-300">{locationError}</p> : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <button
          type="button"
          className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Confirmar ubicación y continuar"
          onClick={handleSaveAndContinue}
          disabled={!isValidCoordinates(coordinates)}
        >
          Confirmar esta ubicación y continuar
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
