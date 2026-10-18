"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type LocalProfileRecord } from "@/src/lib/profile-db";
import { PwaInstallQr } from "@/src/components/siae/PwaInstallQr";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import { AppSidebarNavigation } from "@/src/components/siae/AppSidebarNavigation";
import { useAuth, logoutCurrentSession } from "@/src/modules/auth/auth-store";
import { StaffPortalHub } from "@/src/features/citizen-portal/components/StaffPortalHub";
import { CitizenHeroStage } from "@/src/features/citizen-portal/components/CitizenHeroStage";
import { CitizenMedicalVitalCard } from "@/src/features/citizen-portal/components/CitizenMedicalVitalCard";
import { CitizenAddressesCard } from "@/src/features/citizen-portal/components/CitizenAddressesCard";
import { CitizenQuickAccessCard } from "@/src/features/citizen-portal/components/CitizenQuickAccessCard";
import { CitizenPublicLanding } from "@/src/features/citizen-portal/components/CitizenPublicLanding";
import {
  Lock,
  Radio,
  Users,
  LogOut,
  Smartphone,
} from "lucide-react";

interface DesktopCitizenPortalProps {
  profile: LocalProfileRecord;
  onTriggerSosEmergency?: () => void;
}

export function DesktopCitizenPortal({
  profile,
  onTriggerSosEmergency,
}: DesktopCitizenPortalProps) {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  // Mi Panel es la vista por defecto para ciudadanos autenticados.
  // El parámetro ?portal=informativo (generado desde el menú lateral) fuerza la landing.
  const [showCitizenDashboard, setShowCitizenDashboard] = useState(true);
  const [showPwaModal, setShowPwaModal] = useState(true);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (params.get("portal") === "informativo") {
      setShowCitizenDashboard(false);
    } else {
      setShowCitizenDashboard(true);
    }
  }, []);

  const isAuth = mounted && isAuthenticated;
  const activeUser = isAuth ? user : null;

  const isStaff =
    isAuth &&
    (activeUser?.role === "admin" ||
      activeUser?.role === "operador" ||
      activeUser?.role === "despachador" ||
      activeUser?.role === "supervisor" ||
      activeUser?.role === "interprete_lsv");

  // El dashboard personal de ciudadano SOLO se muestra si el usuario está formalmente AUTENTICADO
  // Los visitantes no autenticados SIEMPRE ven la Landing Page informativa institucional.
  const isRegisteredCitizen =
    !isStaff &&
    isAuth &&
    activeUser?.role === "solicitante" &&
    showCitizenDashboard;

  return (
    <div className="flex min-h-screen bg-[var(--background)] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors" suppressHydrationWarning>
      {/* Barra lateral unificada por rol en pantallas desktop para usuarios autenticados */}
      <AppSidebarNavigation onTriggerSos={onTriggerSosEmergency} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Institucional - limpio: logo + estado + usuario */}
        <header className="fluent-acrylic sticky top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 gap-4">
            {/* Logotipo e Identidad Institucional */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] font-black text-white shadow-xs">
                S
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#32577a] dark:text-sky-400 block leading-tight truncate">
                  Servicio Nacional de Emergencias
                </span>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-[var(--accent-hover)] dark:text-white truncate">
                  SIAE &middot; Sistema de Atención a Emergencias
                </h1>
              </div>
            </div>

            {/* Indicador Central de Operación 24/7 */}
            <div className="hidden items-center gap-2 rounded-full border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-semibold text-[var(--accent)] dark:text-sky-300 md:flex shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>VEN 911 Maturín &middot; Operativo 24/7</span>
            </div>

            {/* Grupo de Acciones - solo tema + sesión de usuario */}
            <div className="flex items-center gap-2 shrink-0" suppressHydrationWarning>
              {/* Selector Global de Tema Claro / Oscuro */}
              <ThemeToggle showLabel={false} />

              {/* Menú de Sesión o Acceso */}
              {isAuth && activeUser ? (
                /* Estado Autenticado: Cápsula de Usuario (visible en mobile/tablet cuando el sidebar está oculto) */
                <div className="flex lg:hidden items-center gap-2">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 text-xs shadow-2xs">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-white text-xs ${
                        activeUser.role === "admin"
                          ? "bg-purple-600"
                          : activeUser.role === "operador"
                          ? "bg-cyan-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      {activeUser.nombre_completo.charAt(0)}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate hidden md:inline">
                      {activeUser.nombre_completo.split(" ")[0]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeUser.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          : activeUser.role === "despachador"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : activeUser.role === "operador"
                          ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {activeUser.role === "admin"
                        ? "Admin"
                        : activeUser.role === "despachador"
                        ? "Despachador"
                        : activeUser.role === "operador"
                        ? "Operador"
                        : activeUser.role === "supervisor"
                        ? "Supervisor"
                        : activeUser.role === "interprete_lsv"
                        ? "Intérprete LSV"
                        : "Solicitante"}
                    </span>
                  </div>

                  {activeUser.role === "admin" ? (
                    <Link
                      href="/admin/usuarios"
                      className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] transition whitespace-nowrap"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Panel Admin</span>
                    </Link>
                  ) : activeUser.role === "operador" || activeUser.role === "despachador" || activeUser.role === "supervisor" ? (
                    <Link
                      href="/admin"
                      className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)] transition whitespace-nowrap"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span>{activeUser.role === "despachador" ? "Consola Despacho" : "Consola PSAP"}</span>
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={logoutCurrentSession}
                    title="Cerrar sesion"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    aria-label="Cerrar sesion"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Estado No Autenticado: Acceso Claro al Sistema */
                <div className="flex items-center gap-2" suppressHydrationWarning>
                  <Link
                    href="/login"
                    aria-label="Iniciar sesión"
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs whitespace-nowrap"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Iniciar sesión</span>
                  </Link>
                  <Link
                    href="/register"
                    aria-label="Crear cuenta"
                    className="hidden sm:flex h-10 items-center rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3.5 text-xs font-semibold text-white shadow-xs transition whitespace-nowrap"
                  >
                    <span>Crear cuenta</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex-1 w-full">
          {isStaff || isRegisteredCitizen ? (
            <div className="w-full">
              {isStaff ? (
                /* 1. Vista para Personal Oficial (Admin / Operador VEN 911) */
                <StaffPortalHub activeUser={activeUser} />
              ) : (
                /* 2. Vista de Usuario Registrado en Desktop */
                <div className="space-y-5">
                  {/* HERO EJECUTIVO: Bienvenida y Estado de Conexión */}
                  <CitizenHeroStage
                    profile={profile}
                    onOpenPwaModal={() => setShowPwaModal(true)}
                  />

                  {/* GRID PRINCIPAL BALANCEADO — ANCHO COMPLETO */}
                  <div className="space-y-5">
                    {/* Fila 1: Salud y Accesibilidad */}
                    <CitizenMedicalVitalCard profile={profile} />

                    {/* Fila 2: Domicilios y Contactos */}
                    <CitizenAddressesCard profile={profile} />

                    {/* Fila 3: Accesos Rápidos + Estado VEN 911 */}
                    <CitizenQuickAccessCard />
                  </div>

                  {/* MODAL FLOTANTE DE INSTALACIÓN PWA */}
                  {showPwaModal && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Ventana flotante de instalación PWA"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setShowPwaModal(false);
                      }}
                    >
                      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200">
                        <div id="pwa-install">
                          <PwaInstallQr
                            profile={profile}
                            onClose={() => setShowPwaModal(false)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOTÓN FLOTANTE PARA REABRIR EL MODAL PWA */}
                  {!showPwaModal && (
                    <button
                      type="button"
                      onClick={() => setShowPwaModal(true)}
                      aria-label="Abrir código QR para instalar en móvil"
                      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#0f2b48] hover:bg-[#163859] border border-sky-400/40 text-white px-4 py-2.5 text-xs font-bold shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 group-hover:scale-110 transition">
                        <Smartphone className="h-3.5 w-3.5" />
                      </span>
                      <span>Vincular Móvil</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* LANDING — portal público institucional, separado del panel autenticado */
            <CitizenPublicLanding
              isAuth={isAuth}
              onTriggerSosEmergency={onTriggerSosEmergency}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Alias institucional en español venezolano (Doctrina VEN 911 / SIAE)
export { DesktopCitizenPortal as PortalCiudadanoEscritorio };
