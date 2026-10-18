"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/src/modules/auth/auth-schemas";
import { hasSqlInjectionRisk, hasXssRisk } from "@/src/lib/security";
import { ApiError } from "@/src/lib/api";
import { defaultLocalProfile, readProfileFromDb, saveProfileToDb } from "@/src/lib/profile-db";
import { loginUser, useAuth } from "@/src/modules/auth/auth-store";
import { usePasskey } from "@/src/modules/auth/use-passkey";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import {
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Lock,
  Mail,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15;

export interface UnifiedLoginPageProps {
  mode: "solicitante" | "operativo";
}

export function UnifiedLoginPage({ mode }: UnifiedLoginPageProps) {
  const isOperativo = mode === "operativo";
  const router = useRouter();
  const setSession = useAuth((state) => state.setSession);
  const { authenticate } = usePasskey();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const watchedEmail = watch("email") || "";
  const watchedPassword = watch("password") || "";
  const hasInjectionWarning = hasSqlInjectionRisk(watchedEmail) || hasXssRisk(watchedEmail);

  // Temporizador de bloqueo tras 5 intentos fallidos
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const routeByRole = (role?: string) => {
    if (typeof window !== "undefined") {
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect && redirect.startsWith("/") && !redirect.startsWith("/login") && !redirect.startsWith("/admin/login")) {
        window.location.href = redirect;
        return;
      }
    }
    const r = (role || "").toLowerCase();
    if (r === "admin" || r === "admin_psap" || r === "supervisor") {
      window.location.href = "/admin";
    } else if (r === "operador" || r === "operator") {
      window.location.href = "/operador";
    } else if (r === "despachador" || r === "dispatcher") {
      window.location.href = "/despachador";
    } else if (r === "interprete_lsv" || r === "interprete_lse") {
      window.location.href = "/admin/cint";
    } else {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const r = (user.role || "").toLowerCase();
      const isStaff = ["admin", "operador", "operator", "supervisor", "despachador", "dispatcher", "interprete_lsv"].includes(r);
      // Solo auto-redireccionar si la sesión actual coincide con la consola correspondiente
      if (isOperativo && isStaff) {
        routeByRole(user.role);
      } else if (!isOperativo && !isStaff) {
        routeByRole(user.role);
      }
    }
  }, [isAuthenticated, user, isOperativo]);

  const handleExplicitSubmit = async () => {
    if (lockoutRemaining > 0) {
      setError(`Acceso bloqueado por seguridad. Podrás reintentar en ${lockoutRemaining} segundos.`);
      triggerShake();
      return;
    }

    const emailVal = (watchedEmail || "").trim();
    const passVal = watchedPassword || "";

    if (!emailVal && !passVal) {
      setError(
        isOperativo
          ? "Por favor ingresa tu correo institucional o usuario y tu clave de acceso."
          : "Por favor ingresa tu correo electrónico y tu contraseña."
      );
      triggerShake();
      return;
    }

    if (!emailVal) {
      setError(isOperativo ? "Ingresa tu correo institucional o usuario." : "Ingresa tu correo electrónico.");
      triggerShake();
      return;
    }

    if (hasSqlInjectionRisk(emailVal) || hasXssRisk(emailVal)) {
      setError("El correo o identificador contiene caracteres no permitidos (riesgo de inyección o script).");
      triggerShake();
      return;
    }

    // Validación de formato de correo o usuario mediante loginSchema
    const parsed = loginSchema.safeParse({ email: emailVal, password: passVal || "dummy123" });
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find((i) => i.path.includes("email"));
      if (emailIssue) {
        setError(emailIssue.message);
        triggerShake();
        return;
      }
    }

    if (!passVal) {
      setError("Ingresa tu contraseña o clave de acceso.");
      triggerShake();
      return;
    }

    if (passVal.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      triggerShake();
      return;
    }

    await onSubmit({ email: emailVal, password: passVal });
  };

  const onSubmit = async (values: LoginFormValues) => {
    if (lockoutRemaining > 0) {
      setError(`Acceso bloqueado por seguridad. Espera ${lockoutRemaining} segundos.`);
      triggerShake();
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const loggedUser = await loginUser(values.email, values.password);

      // Verificación de perfil operativo en consola institucional (/admin/login)
      if (isOperativo) {
        const opRoles = ["admin", "operador", "operator", "supervisor", "despachador", "dispatcher", "interprete_lsv"];
        const userRole = (loggedUser.role || "").toLowerCase();
        if (!opRoles.includes(userRole)) {
          useAuth.getState().clearSession();
          setError(
            `Acceso Denegado: La cuenta '${loggedUser.correo_electronico}' tiene rol de solicitante y no cuenta con credenciales para la Consola Operativa VEN 911.`
          );
          triggerShake();
          return;
        }
      }

      // Si es un solicitante ciudadano, sincronizar en base local
      if (!loggedUser.role || loggedUser.role === "user") {
        const storedProfile = await readProfileFromDb();
        const nextProfile = storedProfile ?? {
          ...defaultLocalProfile,
          isAnonymous: false,
          hasCompletedOnboarding: false,
        };

        const isUuid = (val?: string) =>
          Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
        const cleanName =
          loggedUser.nombre_completo &&
          !isUuid(loggedUser.nombre_completo) &&
          !loggedUser.nombre_completo.includes("@")
            ? loggedUser.nombre_completo
            : storedProfile?.name &&
              !isUuid(storedProfile.name) &&
              !storedProfile.name.includes("@")
            ? storedProfile.name
            : values.email.split("@")[0];

        await saveProfileToDb({
          ...nextProfile,
          id: "local",
          isAnonymous: false,
          name: cleanName,
        });
      }

      setFailedAttempts(0);
      setSession(loggedUser);
      routeByRole(loggedUser.role);
    } catch (loginError) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      triggerShake();

      const message =
        loginError instanceof ApiError
          ? loginError.message
          : loginError instanceof Error
          ? loginError.message
          : "Credenciales incorrectas.";

      if (nextFailed >= MAX_FAILED_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_SECONDS);
        setError(`Demasiados intentos fallidos. ${message} Acceso suspendido por ${LOCKOUT_SECONDS} segundos.`);
      } else {
        setError(`${message} (Intento ${nextFailed} de ${MAX_FAILED_ATTEMPTS})`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError(null);
    try {
      await authenticate();
      const currentUser = useAuth.getState().user;
      routeByRole(currentUser?.role);
    } catch (loginError: unknown) {
      let friendlyMsg = "Fallo en verificación de passkey o biometría.";
      if (loginError instanceof Error) {
        if (loginError.name === "NotAllowedError" || loginError.message.toLowerCase().includes("cancel")) {
          friendlyMsg = "Acceso biométrico cancelado o no autorizado en este dispositivo.";
        } else {
          friendlyMsg = loginError.message;
        }
      }
      setError(friendlyMsg);
      triggerShake();
    }
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950 p-0 m-0 overflow-x-hidden transition-colors">
      {/* PANEL IZQUIERDO INSTITUCIONAL (5 Columnas en desktop / Full height) */}
      <div className="lg:col-span-5 bg-gradient-to-b from-[#102e4c] via-[#0d233a] to-[#071524] text-white p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        {/* Glow decorativo de fondo */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Logo e Identidad Superior */}
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

          {/* Sello Circular Central y Título */}
          <div className="pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/40 px-3 py-1 text-xs text-sky-200 backdrop-blur-md mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Nodo Operativo Central 24/7</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              Sistema Inclusivo de Atención a Emergencias
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300 max-w-md">
              Plataforma soberana de auxilio inmediato con prioridad en Lengua de Señas Venezolana (LSV),
              texto en tiempo real (RTT), pictogramas ARASAAC y geolocalización PostGIS.
            </p>
          </div>

          {/* Tarjetas de Garantías Institucionales */}
          <div className="space-y-2.5 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Art. 81 de la Constitución Nacional</p>
                <p className="text-slate-300 text-[11px]">Derecho al uso de LSV y medios accesibles.</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Normativa CONAPDIS & Next-Gen 911</p>
                <p className="text-slate-300 text-[11px]">Total Conversation (ITU-T F.703) y criptografía.</p>
              </div>
            </div>

            {isOperativo && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 backdrop-blur-sm flex items-center gap-3 animate-fadeIn">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Ley Contra Delitos Informáticos</p>
                  <p className="text-slate-300 text-[11px]">Auditoría continua de sesiones y acciones de despacho.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Institucional del Panel Izquierdo */}
        <div className="pt-6 border-t border-white/15 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
          <span>Sede Operativa Maturín, Monagas</span>
          <a
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

      {/* PANEL DERECHO: Formulario de Acceso a Todo lo Ancho (7 Columnas en desktop) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 lg:p-8 xl:p-10 bg-white dark:bg-slate-900 transition-colors min-h-screen overflow-y-auto">
        {/* Barra Superior Derecha: Volver y Estado */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Portal Informativo
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} />
            <span className="fluent-badge bg-sky-50 text-[var(--accent)] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {isOperativo ? "Consola Institucional VEN 911" : "Identidad Segura SIAE"}
            </span>
          </div>
        </div>

        {/* Contenido Central del Formulario */}
        <div className={`max-w-md w-full mx-auto my-auto ${isShaking ? "animate-shake" : ""}`}>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--accent-hover)] dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isOperativo
                ? "Puesto de control institucional para Operadores PSAP, Despachadores CAD, Intérpretes CINT y Administradores."
                : "Ingresa con tu correo ciudadano o ficha médica preventiva para auxilio accesible."}
            </p>
          </div>

          {/* Banner de Advertencia para Personal Operativo */}
          {isOperativo && (
            <div className="mb-4 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Uso Exclusivo de Personal Acreditado</span>
              </div>
              <p className="text-[11px] mt-0.5 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                Puesto sujeto a monitoreo y auditoría criptográfica continua. Queda prohibido el acceso no autorizado.
              </p>
            </div>
          )}

          {/* Banner de Bloqueo por Intentos Fallidos (Lockout) */}
          {isLocked && (
            <div
              className="mb-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/60 p-3 text-xs font-semibold text-red-800 dark:text-red-200 flex items-start gap-2 shadow-md"
              role="alert"
              aria-live="assertive"
            >
              <Clock className="h-4 w-4 text-red-600 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-100">
                  Acceso Suspendido Temporalmente
                </p>
                <p className="mt-0.5">
                  Por seguridad se superaron los 5 intentos. Podrás reintentar en:{" "}
                  <span className="font-black text-sm text-red-700 dark:text-red-300">
                    {lockoutRemaining} s
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Formulario de Login */}
          <form
            id="panel-login-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleExplicitSubmit();
            }}
            className="space-y-4"
            noValidate
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isOperativo ? "Correo Institucional o Usuario" : "Email / Nombre de Usuario"}
                </label>
                {hasInjectionWarning && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Caracteres no permitidos
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  maxLength={100}
                  disabled={isLocked}
                  placeholder={isOperativo ? "usuario@ven911.gob.ve" : "ejemplo@siae.gob.ve"}
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-3 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    errors.email || hasInjectionWarning
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                  }`}
                  {...register("email")}
                  aria-invalid={Boolean(errors.email || hasInjectionWarning)}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="login-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isOperativo ? "Clave de Acceso al Servicio" : "Contraseña"}
                </label>
                {!isOperativo && (
                  <Link
                    href="/recuperar"
                    className="text-xs font-semibold text-[var(--accent)] dark:text-sky-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={128}
                  disabled={isLocked}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/80 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white transition focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 dark:border-slate-700 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                  }`}
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
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
              {errors.password && (
                <p id="login-password-error" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && !isLocked && (
              <div
                id="login-error-banner"
                data-testid="login-error-banner"
                className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60 p-3.5 text-xs font-semibold text-red-700 dark:text-red-300 flex items-start gap-2.5 shadow-sm animate-shake"
                role="alert"
                aria-live="assertive"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-800 dark:text-red-200">
                    {error.toLowerCase().includes("denegado")
                      ? "Acceso No Autorizado"
                      : error.toLowerCase().includes("conexión")
                      ? "Fallo de Comunicación"
                      : error.toLowerCase().includes("bloqueado") || error.toLowerCase().includes("suspendido")
                      ? "Seguridad SIAE"
                      : "Error de Validación / Autenticación"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <button
              id="btn-login-submit"
              data-testid="btn-login-submit"
              type="button"
              onClick={handleExplicitSubmit}
              disabled={submitting || isSubmitting || isLocked}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--accent-hover)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>
                {isLocked
                  ? `Bloqueado (${lockoutRemaining}s)`
                  : submitting || isSubmitting
                  ? "Autenticando servicio..."
                  : isOperativo
                  ? "Iniciar sesión de Servicio"
                  : "Iniciar sesión con Correo"}
              </span>
            </button>

            <button
              type="button"
              disabled={isLocked}
              onClick={handlePasskeyLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-[var(--accent)] dark:text-sky-400" />
              <span>Acceso con Biometría o Passkey</span>
            </button>
          </form>

          {/* Enlaces de Pie del Formulario y Conmutador de Consola */}
          <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2">
            {!isOperativo ? (
              <>
                <p>
                  ¿No tienes cuenta aún?{" "}
                  <Link href="/register" className="font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
                    Registrar nuevo perfil ciudadano (Ficha Médica)
                  </Link>
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">¿Personal de VEN 911 o Administrador? </span>
                  <Link
                    href="/admin/login"
                    className="font-bold text-sky-800 dark:text-sky-300 hover:underline text-[11px] inline-flex items-center gap-1"
                  >
                    <span>Consola Operativa VEN 911</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p>
                  Las credenciales operativas son asignadas y auditadas por la Dirección de Tecnología VEN 911.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">¿Eres ciudadano o solicitante de emergencia? </span>
                  <Link
                    href="/login"
                    className="font-bold text-sky-800 dark:text-sky-300 hover:underline text-[11px] inline-flex items-center gap-1"
                  >
                    <span>Portal de Acceso Ciudadano</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Derecho */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>SIAE v1.2 · VEN 911 Monagas</span>
          <span>Cumplimiento WCAG 2.2 AA</span>
        </div>
      </div>
    </main>
  );
}
