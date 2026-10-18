"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SosFab } from "@/src/components/siae/SosFab";
import { OfflineBanner } from "@/src/components/siae/OfflineBanner";
import { OutboxStatus } from "@/src/components/siae/OutboxStatus";
import { VoiceActivationButton } from "@/src/components/siae/VoiceActivationButton";
import { ExternalSwitchButton } from "@/src/components/siae/ExternalSwitchButton";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useDeviceContext } from "@/src/hooks/use-device-context";
import { DesktopCitizenPortal } from "@/src/components/siae/DesktopCitizenPortal";
import { MobileBottomNav } from "@/src/components/siae/MobileBottomNav";
import {
  db,
  defaultLocalProfile,
  readProfileFromDb,
  saveProfileToDb,
  type LocalProfileRecord,
} from "@/src/lib/profile-db";
import { getUiCopy } from "@/src/lib/ui-copy";
import { useRouter } from "next/navigation";

const onboardingSteps = [
  {
    title: "Hola",
    text: "Tu emergencia puede activarse con un solo gesto, una sola palabra o un solo toque.",
    pictograms: ["🚨", "🆘", "📞"],
  },
  {
    title: "Ubicación",
    text: "La app te ayuda a compartir tu posición y a confirmar la ayuda sin perder tiempo.",
    pictograms: ["📍", "🧭", "📡"],
  },
  {
    title: "Canales",
    text: "Puedes responder por texto o voz y seguir conectado mientras llega la asistencia.",
    pictograms: ["💬", "🎧", "📹"],
  },
];

export default function Home() {
  const router = useRouter();
  const startActivation = useEmergency((state) => state.startActivation);
  const [profile, setProfile] = useState<LocalProfileRecord>(defaultLocalProfile);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [step, setStep] = useState(0);
  const [desktopSosMode, setDesktopSosMode] = useState(false);
  const device = useDeviceContext();
  const copy = getUiCopy(profile.preferredLocale);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        // Detectar si la PWA móvil se abre mediante el escaneo del Código QR del Desktop Portal
        let syncedProfileData: Partial<LocalProfileRecord> | null = null;
        if (typeof window !== "undefined" && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const rawSync = params.get("sync_profile");
          if (rawSync) {
            try {
              syncedProfileData = JSON.parse(decodeURIComponent(rawSync)) as Partial<LocalProfileRecord>;
              window.history.replaceState({}, "", window.location.pathname);
            } catch {
              // Si falla la decodificación, continuar con la carga local normal
            }
          }
        }

        const stored = await readProfileFromDb();
        if (!isMounted) return;
        const baseProfile = stored ?? defaultLocalProfile;

        if (syncedProfileData) {
          const mergedProfile: LocalProfileRecord = {
            ...baseProfile,
            ...syncedProfileData,
            hasCompletedOnboarding: true,
            isAnonymous: false,
            updatedAt: new Date().toISOString(),
          };
          await saveProfileToDb(mergedProfile);
          if (!isMounted) return;
          setProfile(mergedProfile);
          setShowOnboarding(false);
          if (typeof document !== "undefined" && mergedProfile.theme) {
            document.documentElement.dataset.theme = mergedProfile.theme;
          }
        } else {
          setProfile(baseProfile);
          setShowOnboarding(!baseProfile.hasCompletedOnboarding);
        }
      } catch {
        if (isMounted) {
          setProfile(defaultLocalProfile);
          setShowOnboarding(true);
        }
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentStep = useMemo(() => onboardingSteps[step], [step]);

  const persistProfile = async (nextProfile: LocalProfileRecord) => {
    setProfile(nextProfile);
    await saveProfileToDb(nextProfile);
  };

  // Si el usuario es visitante anónimo o navega desde escritorio (y no está en modo SOS explícito)
  if (profile.isAnonymous || (device.isMounted && device.isDesktop && !device.isStandalone && !desktopSosMode)) {
    return (
      <DesktopCitizenPortal
        profile={profile}
        onTriggerSosEmergency={() => setDesktopSosMode(true)}
      />
    );
  }

  if (!profile.hasCompletedOnboarding) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center gap-6">
          <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Perfil registrado</p>
            <h1 className="mt-3 text-3xl font-semibold">Completa tu configuración</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Antes de pedir ayuda, dinos cómo prefieres ver, oír y usar SIAE.</p>
          </header>
          <Link href="/onboarding" className="primary-button block text-center">Configurar accesibilidad</Link>
        </div>
      </main>
    );
  }

  const finishOnboarding = async () => {
    const nextProfile: LocalProfileRecord = {
      ...profile,
      hasCompletedOnboarding: true,
      name: profile.name || "",
      channels: profile.channels.length ? profile.channels : defaultLocalProfile.channels,
      updatedAt: new Date().toISOString(),
    };

    await persistProfile(nextProfile);
    setShowOnboarding(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 pb-24 text-white sm:px-6">
      <OfflineBanner />
      <div className="mx-auto flex max-w-md flex-col gap-6">
        {desktopSosMode && (
          <button
            type="button"
            onClick={() => setDesktopSosMode(false)}
            className="self-start inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            ← Volver al Portal Ciudadano
          </button>
        )}
        <header className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">SIAE</p>
            <h1 className="text-xl font-semibold">SIAE</h1>
          </div>
          <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
            {copy.online}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-300">{copy.greeting}, {profile.name}</p>
          <h2 className="mt-2 text-2xl font-semibold">{copy.helpTitle}</h2>
          <p className="mt-2 text-sm text-slate-400">{copy.helpSubtitle}</p>
        </section>

        <OutboxStatus />

        {/* ZONA DE SEGURIDAD TÁCTIL (Halo de protección Fitts / Von Restorff) */}
        <section
          className="relative my-2 flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-950/20 via-slate-900/40 to-slate-900/80 py-8 px-4 shadow-2xl"
          aria-label="Activación prioritaria de emergencia"
        >
          <div className="flex justify-center">
            <SosFab />
          </div>

          <div className="mt-6 w-full max-w-xs space-y-2.5">
            <VoiceActivationButton
              onEmergency={() => {
                startActivation();
                router.push("/tipificar");
              }}
            />
            <ExternalSwitchButton
              onEmergency={() => {
                startActivation();
                router.push("/tipificar");
              }}
            />
          </div>
        </section>

        {/* HERRAMIENTAS DE PREVENCIÓN Y SEGUIMIENTO */}
        <div className="mt-4 border-t border-slate-800/80 pt-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Acompañamiento y Prevención
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/camino-seguro" className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800" aria-label="Camino seguro">
              <span className="mb-2 block text-lg" aria-hidden="true">🛡️</span>
              Camino seguro
            </Link>
            <Link href="/historial" className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800" aria-label="Historial">
              <span className="mb-2 block text-lg" aria-hidden="true">💬</span>
              Historial
            </Link>
          </div>
        </div>

        {/* NAVEGACIÓN INSTITUCIONAL SECUNDARIA */}
        <nav className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Navegación principal">
          <Link href="/perfil" className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-center text-sm text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800" aria-label="Perfil">
            Perfil
          </Link>
          <Link href="/ajustes" className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-center text-sm text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800" aria-label="Ajustes">
            Ajustes
          </Link>
          <Link href="/dashboard" className="rounded-2xl border border-cyan-500/50 bg-cyan-500/10 p-3 text-center text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20" aria-label="Panel operativo">
            Panel operativo
          </Link>
          <Link href="/login" className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-center text-sm text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800" aria-label="Iniciar sesión">
            Iniciar sesión
          </Link>
        </nav>
      </div>

      {showOnboarding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" role="region" aria-labelledby="onboarding-title">
            <div className="mb-4 flex justify-center gap-2" role="progressbar" aria-label="Progreso del onboarding" aria-valuemin={1} aria-valuemax={onboardingSteps.length} aria-valuenow={step + 1}>
              {onboardingSteps.map((_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full ${index === step ? "bg-cyan-400" : "bg-slate-700"}`}
                />
              ))}
            </div>

            <div className="mb-6 text-center">
              <div className="mb-4 flex items-center justify-center" role="img" aria-label={`${currentStep.title} pictograma`}>
                <div className="grid h-32 w-32 grid-cols-3 gap-2 rounded-[2rem] border border-cyan-500/30 bg-slate-950 p-3 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                  {currentStep.pictograms.map((pictogram, index) => (
                    <div
                      key={`${currentStep.title}-${pictogram}-${index}`}
                      className="flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-3xl"
                      aria-hidden="true"
                    >
                      {pictogram}
                    </div>
                  ))}
                </div>
              </div>
              <h3 id="onboarding-title" className="text-2xl font-semibold">{currentStep.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{currentStep.text}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 font-medium text-slate-100"
                onClick={async () => {
                  if (step === onboardingSteps.length - 1) {
                    await finishOnboarding();
                    return;
                  }

                  setStep((current) => current + 1);
                }}
              >
                {step === onboardingSteps.length - 1 ? copy.continue : copy.next}
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-3 font-medium text-slate-300"
                onClick={finishOnboarding}
              >
                {copy.skip}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <MobileBottomNav isAnonymous={profile.isAnonymous} />
    </main>
  );
}
