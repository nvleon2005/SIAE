"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  addressSchema,
  contactSchema,
  type AddressFormValues,
  type ContactFormValues,
} from "@/src/modules/profile/profile-schemas";

import { useState } from "react";
import { MapPicker } from "@/src/components/siae/MapPicker";
import {
  MapPin,
  Navigation,
  Radio,
  Check,
  Compass,
  AlertCircle,
  Home,
  Building2,
  GraduationCap,
  Users,
} from "lucide-react";

interface AddressFormProps {
  initialValues?: AddressFormValues;
  mapHeight?: number;
  onSubmit: (values: AddressFormValues) => void;
  onCancel: () => void;
}

export function AddressForm({
  initialValues = { label: "", value: "", referencePoint: "", parroquia: "", lat: 9.7457, lng: -63.1832 },
  mapHeight = 220,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialValues.label || "",
      value: initialValues.value || "",
      referencePoint: initialValues.referencePoint || "",
      parroquia: initialValues.parroquia || "",
      lat: initialValues.lat ?? 9.7457,
      lng: initialValues.lng ?? -63.1832,
      accuracy: initialValues.accuracy,
    },
  });

  const [coords, setCoords] = useState({
    lat: initialValues.lat ?? 9.7457,
    lng: initialValues.lng ?? -63.1832,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const selectedLabel = watch("label");

  const quickLabels = [
    { label: "Casa", icon: Home },
    { label: "Trabajo", icon: Building2 },
    { label: "Estudio", icon: GraduationCap },
    { label: "Familiar", icon: Users },
    { label: "Frecuente", icon: MapPin },
  ];

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("La geolocalización satelital no está disponible en este dispositivo.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const roundedAcc = Math.round(accuracy);
        setValue("lat", latitude);
        setValue("lng", longitude);
        setValue("accuracy", roundedAcc);
        setCoords({ lat: latitude, lng: longitude });
        setGpsLoading(false);
        setGpsStatus(`✓ Ubicación GPS detectada con precisión de ±${roundedAcc}m.`);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError("No se pudo obtener el GPS automáticamente. Puedes marcar tu ubicación exacta en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapChange = (lat: number, lng: number) => {
    setValue("lat", lat);
    setValue("lng", lng);
    setCoords({ lat, lng });
    setGpsStatus(`📍 Marcador fijado en: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Mensajes de Estado GPS */}
      {gpsStatus && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {gpsError && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Grid de 2 Columnas Optimizada para Pantallas Grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Datos y Referencias (5 columnas) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selector de Etiquetas */}
          <div>
            <label htmlFor="address-label" className="block text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2.5">
              Tipo o Nombre de Ubicación
            </label>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {quickLabels.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setValue("label", label)}
                  className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-xl text-[10px] font-bold transition border cursor-pointer ${
                    selectedLabel === label
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <input
              id="address-label"
              aria-label="Nombre de la ubicación"
              placeholder="Ej: Residencia Principal, Taller, Casa Materna..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/60 transition shadow-xs"
              {...register("label")}
              aria-invalid={Boolean(errors.label)}
              aria-describedby={errors.label ? "address-label-error" : undefined}
            />
            {errors.label ? (
              <p id="address-label-error" className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                {errors.label.message}
              </p>
            ) : null}
          </div>

          {/* Parroquia de Maturín */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2" htmlFor="address-parroquia">
              Parroquia (Municipio Maturín)
            </label>
            <select
              id="address-parroquia"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/60 transition cursor-pointer shadow-xs"
              {...register("parroquia")}
            >
              <option value="">Selecciona parroquia de cobertura...</option>
              <option value="San Simón">San Simón (Casco Central · Cuadrantes 1 a 10)</option>
              <option value="Las Cocuizas">Las Cocuizas / El Silencio (Cuadrantes 11 a 15)</option>
              <option value="Alto de Los Godos">Alto de Los Godos (Cuadrantes 16 a 20)</option>
              <option value="Boquerón">Boquerón / Tipuro (Cuadrantes 21 a 25)</option>
              <option value="Santa Cruz">Santa Cruz / Zona Industrial (Cuadrantes 26 a 30)</option>
              <option value="San Vicente">San Vicente (Cuadrantes 31 a 33)</option>
              <option value="El Furrial">El Furrial (Cuadrante 34)</option>
              <option value="Jusepín">Jusepín (Cuadrante 35)</option>
              <option value="La Pica">La Pica (Cuadrantes 36 a 38)</option>
              <option value="El Corozo">El Corozo (Cuadrantes 39 a 40)</option>
            </select>
          </div>

          {/* Sector, Calle, Número */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2" htmlFor="address-value">
              Sector / Calle / Número o Manzana
            </label>
            <input
              id="address-value"
              placeholder="Ej: Sector Tipuro II, Calle 3, Casa #14"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/60 transition shadow-xs"
              {...register("value")}
              aria-invalid={Boolean(errors.value)}
              aria-describedby={errors.value ? "address-value-error" : undefined}
            />
            {errors.value ? (
              <p id="address-value-error" className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                {errors.value.message}
              </p>
            ) : null}
          </div>

          {/* Punto de Referencia Visual VEN 911 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300" htmlFor="address-reference">
                Punto de Referencia Visual
              </label>
              <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg">
                Crítico para Rescate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-snug">
              Describe lo visible desde el vehículo de patrulla o ambulancia (color de rejas, portón, esquinas, comercios o árboles).
            </p>
            <textarea
              id="address-reference"
              rows={3}
              placeholder="Ej: Casa de dos plantas con portón blanco y rejas negras, frente a la Panadería La Espiga, diagonal a la cancha techada..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/60 transition leading-relaxed resize-none shadow-xs"
              {...register("referencePoint")}
            />
          </div>
        </div>

        {/* Columna Derecha: Mapa y Posicionamiento Satelital (7 columnas) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barra de Control GPS Superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shadow-xs">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                  Georreferenciación Satelital
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Lat {coords.lat.toFixed(4)} · Lng {coords.lng.toFixed(4)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              {gpsLoading ? (
                <>
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  <span>Sincronizando satélites...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Detectar mi GPS actual</span>
                </>
              )}
            </button>
          </div>

          {/* Contenedor del Mapa */}
          <div className="rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm">
            <MapPicker
              initialLat={coords.lat}
              initialLng={coords.lng}
              height={mapHeight}
              onChange={handleMapChange}
            />
          </div>

          <div className="rounded-xl border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/70 dark:bg-sky-950/40 p-3 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5 leading-relaxed">
            <span className="text-base leading-none shrink-0">📍</span>
            <span>
              <strong>Precisión milimétrica:</strong> Haz clic en cualquier parte del mapa o arrastra el marcador rojo para posicionar el techo o entrada vehicular exacta de tu inmueble.
            </span>
          </div>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          id="btn-save-address"
          type="submit"
          className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-6 py-2.5 text-sm font-black text-white transition disabled:opacity-50 shadow-md cursor-pointer inline-flex items-center gap-2 active:scale-95"
          disabled={isSubmitting}
        >
          <MapPin className="h-4 w-4" />
          <span>Guardar Domicilio y Referencias</span>
        </button>
      </div>
    </form>
  );
}
interface ContactFormProps {
  initialValues?: ContactFormValues;
  onSubmit: (values: ContactFormValues) => void;
  onCancel: () => void;
}

export function ContactForm({ initialValues = { name: "", phone: "", relation: "" }, onSubmit, onCancel }: ContactFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialValues,
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Añadir Contacto de Auxilio</h3>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="contact-name">Nombre y Apellido</label>
        <input id="contact-name" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition" {...register("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
        {errors.name ? <p id="contact-name-error" className="text-sm text-red-200" role="alert">{errors.name.message}</p> : null}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="contact-phone">Número de Teléfono (con código de país)</label>
        <input id="contact-phone" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition" inputMode="tel" placeholder="Ej: +584141234567" {...register("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : undefined} />
        {errors.phone ? <p id="contact-phone-error" className="text-sm text-red-200" role="alert">{errors.phone.message}</p> : null}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="contact-relation">Vínculo o Parentesco</label>
        <input id="contact-relation" placeholder="Ej: Hermano, Pareja, Cuidador..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition" {...register("relation")} aria-invalid={Boolean(errors.relation)} aria-describedby={errors.relation ? "contact-relation-error" : undefined} />
        {errors.relation ? <p id="contact-relation-error" className="text-sm text-red-200" role="alert">{errors.relation.message}</p> : null}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50" disabled={isSubmitting}>Guardar Contacto</button>
        <button type="button" className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
