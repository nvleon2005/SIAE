"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "@/src/modules/auth/auth-schemas";
import { PasskeyPrompt } from "@/src/components/siae/PasskeyPrompt";
import { evaluatePasswordStrength, hasSqlInjectionRisk, hasXssRisk } from "@/src/lib/security";
import { ApiError } from "@/src/lib/api";
import { defaultLocalProfile, saveProfileToDb } from "@/src/lib/profile-db";
import { usePasskey } from "@/src/modules/auth/use-passkey";
import { registerUser, useAuth } from "@/src/modules/auth/auth-store";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { PwaInstallQr } from "@/src/components/siae/PwaInstallQr";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuth((state) => state.setSession);
  const { register: registerWebAuthn } = usePasskey();
  const [submitting, setSubmitting] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [showPwaInstallStep, setShowPwaInstallStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "" },
  });

  const watchedPassword = watch("password") || "";
  const passwordStrength = evaluatePasswordStrength(watchedPassword);
  const watchedEmail = watch("email") || "";
  const hasInjectionWarning = hasSqlInjectionRisk(watchedEmail) || hasXssRisk(watchedEmail);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);

    try {
      // Registro real contra backend Go → emite cookies HttpOnly automáticamente
      const registeredUser = await registerUser(values.name, values.email, values.password);

      // Guardar sesión en el store de Zustand
      setSession(registeredUser);

      await saveProfileToDb({
        ...defaultLocalProfile,
        id: "local",
        isAnonymous: false,
        name: values.name || values.email.split("@")[0],
        phone: values.phone,
        channels: defaultLocalProfile.channels,
        hasCompletedOnboarding: false,
      });

      setShowPasskeyPrompt(true);
    } catch (err) {
      triggerShake();
      setValue("password", "");
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      await registerWebAuthn();
      setShowPasskeyPrompt(false);
      setShowPwaInstallStep(true);
    } catch {
      setError("No se pudo registrar la passkey biométrica. Puedes continuar a tu ficha y configurarla más tarde.");
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950 p-0 m-0 overflow-x-hidden transition-colors">
      {/* PANEL IZQUIERDO INSTITUCIONAL (5 Columnas en desktop / Full height) */}
      <div className="lg:col-span-5 bg-gradient-to-b from-[#102e4c] via-[#0d233a] to-[#071524] text-white p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl shadow-lg">
              S
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300 block">
                República Bolivariana de Venezuela
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100">
                Centro de Comando VEN 911 · Maturín, Edo. Monagas
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/40 px-3 py-1 text-xs text-sky-200 backdrop-blur-md mb-3">
              <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Registro Preventivo de Solicitante</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              Crea tu Ficha Médica y de Accesibilidad
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300 max-w-md">
              Regístrate para que los operadores del VEN 911 conozcan tus necesidades de apoyo (LSV, RTT, pictogramas)
              y tus contactos de emergencia ante cualquier incidente.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Privacidad Criptográfica de Salud</p>
                <p className="text-slate-300 text-[11px]">Datos médicos cifrados que solo se transmiten al activar SOS.</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Respaldo Oficial VEN 911 Maturín</p>
                <p className="text-slate-300 text-[11px]">Enrutamiento automático al Centro de Despacho de Monagas.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/15 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
          <span>Portal Oficial de Emergencias</span>
          <a
            suppressHydrationWarning
            href="https://ven911.gob.ve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-sky-300 hover:text-white transition underline"
          >
            <span>ven911.gob.ve</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario de Registro a Pantalla Completa */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 lg:p-8 xl:p-10 bg-white dark:bg-slate-900 transition-colors min-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <Link
            suppressHydrationWarning
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Portal Informativo
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} />
            <span className="fluent-badge bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Registro Gratuito
            </span>
          </div>
        </div>

        <div className={`max-w-md w-full mx-auto my-auto ${isShaking ? "animate-shake" : ""}`}>
          {!showPasskeyPrompt ? (
            <>
              <div className="mb-4">

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--accent-hover)] dark:text-white">
                  Crear Ficha Médica Ciudadana
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Ingresa tus datos personales para configurar tus apoyos de accesibilidad y contactos de auxilio en tu PWA móvil.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="register-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nombre y Apellido
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Sin acentos ni símbolos
                    </span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      maxLength={80}
                      placeholder="Maria Elena Lopez"
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                      }`}
                      {...register("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "register-name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="register-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="register-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email / Correo Electrónico
                    </label>
                    {hasInjectionWarning && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Caracteres sospechosos
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      maxLength={100}
                      placeholder="maria@ejemplo.com"
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.email || hasInjectionWarning
                          ? "border-red-500 focus:ring-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                      }`}
                      {...register("email")}
                      aria-invalid={Boolean(errors.email || hasInjectionWarning)}
                      aria-describedby={errors.email ? "register-email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="register-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Teléfono
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input
                      id="register-phone"
                      type="tel"
                      placeholder="04141234567"
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                      }`}
                      {...register("phone")}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contraseña (mínimo 8 caracteres)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={128}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                      }`}
                      {...register("password")}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "register-password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {watchedPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Fortaleza:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full transition-all ${
                              step <= passwordStrength.score ? passwordStrength.color : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p id="register-password-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={128}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                      }`}
                      {...register("confirmPassword")}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined}
                    />
                  </div>

                  {errors.confirmPassword && (
                    <p id="register-confirm-password-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 shadow-xs" role="alert">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--accent-hover)] active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-3"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{submitting || isSubmitting ? "Validando y creando cuenta..." : "Crear cuenta y continuar a mi ficha"}</span>
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
                ¿Ya tienes una cuenta registrada?{" "}
                <Link suppressHydrationWarning href="/login" className="font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
                  Iniciar sesión aquí
                </Link>
              </div>
            </>
          ) : showPwaInstallStep ? (
            <div className="space-y-6">
              <div className="text-center md:text-left mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 text-xs font-bold mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Paso 2: Instalación Móvil Prioritaria
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Instala SIAE en tu teléfono móvil
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tu ficha médica y de prioridad VEN 911 está lista. Para disponer del botón SOS con geolocalización continua en la calle, instala la aplicación en tu smartphone ahora.
                </p>
              </div>

              <PwaInstallQr />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/onboarding")}
                  className="flex-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] dark:bg-cyan-500 dark:hover:bg-cyan-400 py-3 px-4 text-center text-xs font-bold text-white dark:text-slate-950 transition shadow-xs cursor-pointer"
                >
                  Comenzar configuración →
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/perfil")}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs cursor-pointer"
                >
                  Ir a mi perfil
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center md:text-left mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 text-xs font-bold mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Cuenta creada exitosamente
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  Activar acceso biométrico
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Configura tu huella o Face ID (Passkey) para acceder en segundos sin recordar contraseñas.
                </p>
              </div>

              <PasskeyPrompt
                onContinue={handleRegisterPasskey}
                onLater={() => {
                  setShowPasskeyPrompt(false);
                  setShowPwaInstallStep(true);
                }}
              />

              {error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs font-semibold text-amber-800 dark:text-amber-300" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>SIAE v1.2 · VEN 911 Monagas</span>
          <span>Cumplimiento Art. 81 CRBV</span>
        </div>
      </div>
    </main>
  );
}
