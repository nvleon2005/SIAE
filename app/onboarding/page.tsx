"use client";

import { useEffect, useState } from "react";
import {
  db,
  defaultLocalProfile,
  readProfileFromDb,
  saveProfileToDb,
  type LocalProfileRecord,
} from "@/src/lib/profile-db";
import { useRouter } from "next/navigation";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { PwaSimulatorMockup } from "@/src/components/siae/PwaSimulatorMockup";
import { saveRemoteProfile } from "@/src/modules/profile/profile-sync";

import {
  Eye,
  Ear,
  Accessibility,
  MapPin,
  MessageSquare,
  Phone,
  Video,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Volume2,
  MicOff,
  Brain,
  UserCheck,
  Info,
  Sparkles,
  Radio,
  Sliders,
} from "lucide-react";

interface DisabilityItem {
  value: LocalProfileRecord["disabilities"][number];
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestedChannels: string;
}

const disabilityList: DisabilityItem[] = [
  {
    value: "low_vision",
    title: "Baja Visión",
    badge: "Alto Contraste & Zoom",
    description: "Activa fondo negro puro (#000000), tipografía amarilla de alto contraste y escala al 150%.",
    icon: Eye,
    suggestedChannels: "Voz · Texto RTT",
  },
  {
    value: "deaf",
    title: "Sordera Profunda (LSV)",
    badge: "Videollamada con Intérprete",
    description: "Prioriza conexión de video en Lengua de Señas Venezolana y texto RTT sin llamadas audibles.",
    icon: Ear,
    suggestedChannels: "Video LSV · Texto RTT",
  },
  {
    value: "hard_of_hearing",
    title: "Dificultad Auditiva",
    badge: "Subtítulos & RTT",
    description: "Activa transcripción automática y amplificación de alertas hápticas por vibración.",
    icon: Volume2,
    suggestedChannels: "Texto RTT · Video LSV",
  },
  {
    value: "blind",
    title: "Ceguera Total",
    badge: "Voz & Lector de Pantalla",
    description: "Habilita activación audible por frase 'Oye SIAE', navegación accesible y audiodescripción.",
    icon: MicOff,
    suggestedChannels: "Canal de Voz · RTT",
  },
  {
    value: "motor",
    title: "Movilidad Reducida",
    badge: "Pulsador Switch & 88px",
    description: "Aumenta todos los botones a 88×88 px y añade compatibilidad con pulsador externo.",
    icon: Accessibility,
    suggestedChannels: "Texto RTT · Pulsador",
  },
  {
    value: "speech",
    title: "Dificultad del Habla",
    badge: "Texto RTT & Pictogramas",
    description: "Permite comunicarse íntegramente por mensajes instantáneos sin exigir hablar al operador.",
    icon: MessageSquare,
    suggestedChannels: "Texto RTT · Pictogramas",
  },
  {
    value: "cognitive",
    title: "Dificultad Cognitiva / TEA",
    badge: "Lectura Fácil ARASAAC",
    description: "Interfaz simplificada con pictogramas intuitivos y explicaciones claras sin jerga técnica.",
    icon: Brain,
    suggestedChannels: "Pictogramas · Asistencia",
  },
  {
    value: "elderly",
    title: "Adulto Mayor",
    badge: "Texto Ampliado & SOS Simple",
    description: "Letras grandes, interfaz despejada y botón de auxilio de un solo toque sin complicaciones.",
    icon: UserCheck,
    suggestedChannels: "Voz · Asistencia Rápida",
  },
  {
    value: "none",
    title: "Sin Discapacidad Declarada",
    badge: "Modo Estándar",
    description: "Acceso a todos los canales regulares de atención con respuesta multicanal completa.",
    icon: ShieldCheck,
    suggestedChannels: "Voz · Video · Texto",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfileRecord>(defaultLocalProfile);
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (typeof window !== "undefined" && "indexedDB" in window) {
          await db.open();
        }
        const stored = await readProfileFromDb();
        setProfile(stored ?? defaultLocalProfile);
      } catch {
        setProfile(defaultLocalProfile);
      } finally {
        setIsReady(true);
      }
    };

    load();
  }, []);

  const persistProfile = async (nextProfile: LocalProfileRecord) => {
    setProfile(nextProfile);
    await saveProfileToDb(nextProfile);
  };

  const toggleChannel = async (channel: LocalProfileRecord["channels"][number]) => {
    const nextChannels = profile.channels.includes(channel)
      ? profile.channels.filter((item) => item !== channel)
      : [...profile.channels, channel];

    triggerHapticFeedback("tap");
    await persistProfile({ ...profile, channels: nextChannels });
  };

  const selectDisability = async (disability: LocalProfileRecord["disabilities"][number]) => {
    triggerHapticFeedback("tap");
    const adaptation: Partial<LocalProfileRecord> = {
      disabilities: disability === "none" ? [] : [disability],
    };

    if (disability === "blind") {
      adaptation.channels = ["voz", "rtt"];
      adaptation.theme = "dark";
      adaptation.fontScale = 1.25;
    } else if (disability === "deaf" || disability === "hard_of_hearing") {
      adaptation.channels = ["rtt", "video"];
      adaptation.theme = "dark";
    } else if (disability === "low_vision" || disability === "elderly") {
      adaptation.fontScale = 1.5;
      adaptation.theme = "high_contrast";
    } else if (disability === "cognitive") {
      adaptation.pictogramsOnly = true;
      adaptation.theme = "light";
      adaptation.easyRead = true;
    } else if (disability === "motor") {
      adaptation.fontScale = 1.25;
      adaptation.theme = "dark";
    } else if (disability === "none") {
      adaptation.theme = "light";
      adaptation.fontScale = 1.0;
    }

    await persistProfile({ ...profile, ...adaptation });
  };

  const handleLocationPermission = async () => {
    try {
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              void persistProfile({ ...profile, locationAllowed: true });
              resolve();
            },
            () => {
              void persistProfile({ ...profile, locationAllowed: false });
              resolve();
            },
            { timeout: 5000 },
          );
        });
      } else {
        await persistProfile({ ...profile, locationAllowed: false });
      }
    } catch {
      await persistProfile({ ...profile, locationAllowed: false });
    }
  };

  const finishOnboarding = async () => {
    const nextProfile: LocalProfileRecord = {
      ...profile,
      hasCompletedOnboarding: true,
      name: profile.name || "Solicitante",
      channels: profile.channels.length ? profile.channels : defaultLocalProfile.channels,
      locationAllowed: profile.locationAllowed,
      updatedAt: new Date().toISOString(),
    };

    await persistProfile(nextProfile);
    try {
      await saveRemoteProfile(nextProfile);
    } catch {
      // Offline mode ok
    }
    router.push("/");
  };

  if (!isReady) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white flex items-center justify-center">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-300 shadow-2xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
          <p className="font-bold text-base text-white">Iniciando Sistema SIAE</p>
          <p className="text-xs text-slate-400 mt-1">Cargando protocolo de accesibilidad VEN 911...</p>
        </div>
      </main>
    );
  }

  const stepsMeta = [
    { title: "Accesibilidad", subtitle: "Define la adaptación visual, auditiva o motora" },
    { title: "Geolocalización", subtitle: "Coordenadas ante el VEN 911 Monagas" },
    { title: "Canales", subtitle: "Video LSV, Texto RTT y Canal de Voz" },
    { title: "Ficha Lista", subtitle: "Activación inmediata en tu teléfono" },
  ];

  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* BARRA SUPERIOR INSTITUCIONAL */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-lg shadow-md shadow-red-900/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                VEN 911 · Monagas
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                PWA Adaptativa
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Sistema Integrado de Atención a Emergencias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline text-slate-400">Solicitante:</span>
          <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 truncate max-w-[160px]">
            {profile.name || "Nuevo Solicitante"}
          </span>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL EN DASHBOARD DE 2 COLUMNAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA: Asistente Interactivo de Configuración */}
          <section className="lg:col-span-7 space-y-6">
            {/* Barra de progreso de 4 pasos */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400">
                  Paso {step + 1} de {stepsMeta.length}: {stepsMeta[step].title}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(((step + 1) / stepsMeta.length) * 100)}% Completado
                </span>
              </div>

              {/* Indicadores de paso */}
              <div className="grid grid-cols-4 gap-2">
                {stepsMeta.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 text-left ${
                      idx === step
                        ? "bg-sky-400 ring-2 ring-sky-400/40"
                        : idx < step
                        ? "bg-emerald-500"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    title={s.title}
                  />
                ))}
              </div>
            </div>

            {/* PASO 0: SELECCIÓN DE ACCESIBILIDAD Y NECESIDAD */}
            {step === 0 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50 p-6 sm:p-7 shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-sky-950/70 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300 mb-3">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Personalización de Asistencia Contractual (Art. 81 CRBV)</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Tu Accesibilidad: ¿Cómo prefieres interactuar con el 911?
                  </h1>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Al seleccionar tu necesidad, la PWA en tu teléfono celular activará
                    automáticamente los contrastes visuales, canales de señas LSV o pulsadores adecuados.
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {disabilityList.map((item) => {
                      const Icon = item.icon;
                      const isSelected =
                        item.value === "none"
                          ? profile.disabilities.length === 0
                          : profile.disabilities.includes(item.value);

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => void selectDisability(item.value)}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-sky-400 bg-sky-950/50 shadow-lg shadow-sky-950/50 ring-2 ring-sky-400"
                              : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                                  isSelected
                                    ? "bg-sky-400 text-slate-950 font-bold"
                                    : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isSelected
                                    ? "border-sky-400/40 bg-sky-400/20 text-sky-200"
                                    : "border-slate-700 bg-slate-800 text-slate-400"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>

                            <h2
                              className={`text-base font-bold transition-colors ${
                                isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                              }`}
                            >
                              {item.title}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Canales:</span>
                            <span
                              className={`font-semibold ${
                                isSelected ? "text-sky-300" : "text-slate-400"
                              }`}
                            >
                              {item.suggestedChannels}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 1: GEOLOCALIZACIÓN Y CUADRANTES DE PAZ */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Respuesta Inmediata y Cuadrantes de Paz</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Ubicación y Geolocalización GPS
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Al activar una emergencia, tus coordenadas exactas (latitud, longitud y precisión)
                    se envían directamente al Centro de Despacho VEN 911 en Maturín para el envío de patrullas o ambulancias.
                  </p>

                  <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400">
                      <Radio className="h-10 w-10 animate-pulse" />
                    </div>

                    <div>
                      <p className="text-base font-bold text-white">
                        {profile.locationAllowed
                          ? "✓ Ubicación Satelital GPS Autorizada"
                          : "Ubicación Satelital Desactivada"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        {profile.locationAllowed
                          ? "Tu teléfono compartirá el cuadrante de paz correspondiente en caso de auxilio."
                          : "Si no autorizas GPS, podrás ingresar tu dirección por referencia escrita en el incidente."}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => void handleLocationPermission()}
                        className={`rounded-xl px-5 py-3 text-xs font-bold transition shadow-md cursor-pointer ${
                          profile.locationAllowed
                            ? "bg-emerald-600 text-white hover:bg-emerald-500"
                            : "bg-sky-500 text-slate-950 hover:bg-sky-400"
                        }`}
                      >
                        {profile.locationAllowed ? "Re-verificar Coordenadas GPS" : "Conceder Permiso de Ubicación"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void persistProfile({ ...profile, locationAllowed: false })}
                        className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                      >
                        Omitir (Referencia Manual)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: PROTOCOLOS Y CANALES DE COMUNICACIÓN */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-sky-950/70 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300 mb-3">
                    <Radio className="h-3.5 w-3.5" />
                    <span>Canales Oficiales Disponibles</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Canales de Comunicación con el Operador
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Personaliza los canales de respuesta que se abrirán cuando toques el botón SOS.
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      {
                        id: "video",
                        title: "Videollamada en Lengua de Señas (LSV)",
                        desc: "Enlace directo con intérprete oficial certificado por VEN 911 en pantalla vertical 9:16.",
                        icon: Video,
                        badge: "Intérprete en Vivo",
                      },
                      {
                        id: "rtt",
                        title: "Texto en Tiempo Real (RTT)",
                        desc: "Chat carácter por carácter sin presionar 'Enviar'; el operador lee mientras escribes.",
                        icon: MessageSquare,
                        badge: "Ultra Rápido",
                      },
                      {
                        id: "voz",
                        title: "Canal de Voz Telefónico Tradicional",
                        desc: "Audio bidireccional estándar con el operador de guardia del centro de comando.",
                        icon: Phone,
                        badge: "Telefonía 911",
                      },
                    ].map((channel) => {
                      const Icon = channel.icon;
                      const active = profile.channels.includes(
                        channel.id as LocalProfileRecord["channels"][number],
                      );

                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() =>
                            void toggleChannel(
                              channel.id as LocalProfileRecord["channels"][number],
                            )
                          }
                          className={`w-full flex items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition cursor-pointer ${
                            active
                              ? "border-sky-400 bg-sky-950/40 ring-1 ring-sky-400 shadow-md"
                              : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${
                                active ? "bg-sky-400 text-slate-950" : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-white">{channel.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                  {channel.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 max-w-md">{channel.desc}</p>
                            </div>
                          </div>

                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                              active
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                : "border-slate-700 bg-slate-800 text-slate-400"
                            }`}
                          >
                            {active ? "Activo" : "Inactivo"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: CONFIRMACIÓN Y FICHA LISTA */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Ficha Médica y de Despacho Lista</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ¡Tu Perfil SIAE está Configurado!
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Tu configuración ha sido guardada en la base de datos cifrada de tu dispositivo.
                    Ante cualquier emergencia en Maturín o Monagas, el Centro de Comando sabrá cómo asistirte.
                  </p>

                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Solicitante:</span>
                      <span className="font-bold text-white">{profile.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Adaptación Primaria:</span>
                      <span className="font-bold text-sky-400">
                        {profile.disabilities.length > 0
                          ? disabilityList.find((d) => d.value === profile.disabilities[0])?.title || "Personalizada"
                          : "Estándar"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Canales Activos:</span>
                      <span className="font-bold text-emerald-400">
                        {profile.channels.join(" · ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-slate-400">Ubicación GPS:</span>
                      <span className="font-bold text-slate-200">
                        {profile.locationAllowed ? "Activada" : "Referencia manual"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BARRA DE NAVEGACIÓN INFERIOR DEL WIZARD */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((curr) => curr - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void finishOnboarding()}
                  className="rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Saltar configuración
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (step === stepsMeta.length - 1) {
                      await finishOnboarding();
                      return;
                    }
                    setStep((curr) => curr + 1);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20 transition active:scale-98 cursor-pointer"
                >
                  <span>{step === stepsMeta.length - 1 ? "Comenzar a usar SIAE" : "Siguiente paso"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA: Simulador Smartphone PWA en Vivo (visible en desktop/tablet) */}
          <aside className="lg:col-span-5 hidden lg:block sticky top-20">
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-2xl backdrop-blur-md">
              <PwaSimulatorMockup profile={profile} step={step} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
