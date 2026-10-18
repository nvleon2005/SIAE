"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, logoutCurrentSession } from "@/src/modules/auth/auth-store";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import {
  Home,
  User,
  ShieldAlert,
  History,
  Settings,
  Radio,
  BarChart3,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Headphones,
  MapPin,
  Globe,
  HeartPulse,
  Accessibility,
} from "lucide-react";

interface AppSidebarNavigationProps {
  onTriggerSos?: () => void;
}

export function AppSidebarNavigation({ onTriggerSos }: AppSidebarNavigationProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("medica");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      setActiveTab(tabParam || "medica");
    }
  }, [pathname]);

  // Si no está montado en cliente o no está autenticado, no mostramos la barra lateral permanente del sistema
  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const role = user.role || "solicitante";
  const isAdmin = role === "admin";
  const isOperator = role === "operador" || role === "supervisor" || role === "interprete_lsv" || role === "despachador";
  const isCitizen = !isAdmin && !isOperator;

  interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const citizenNav: NavItem[] = [
    { href: "/", label: "Mi Portal", icon: Home },
    { href: "/perfil?tab=medica", label: "Ficha Médica", icon: HeartPulse },
    { href: "/perfil?tab=domicilios", label: "Contactos", icon: Users },
    { href: "/perfil?tab=usuario", label: "Datos de la Cuenta", icon: User },
    { href: "/perfil?tab=accesibilidad", label: "Accesibilidad", icon: Accessibility },
    { href: "/camino-seguro", label: "Camino Seguro", icon: ShieldAlert },
    { href: "/historial", label: "Historial de Auxilios", icon: History },
  ];

  const operatorNav: NavItem[] = [
    { href: "/operador", label: "Puesto de Atención (ACD)", icon: Headphones },
    { href: "/operador#atendidas", label: "Incidencias Atendidas", icon: History },
    { href: "/admin/cint", label: "Consola CInt (LSV)", icon: Headphones },
  ];

  const dispatcherNav: NavItem[] = [
    { href: "/despachador", label: "Consola de Despacho CAD", icon: Radio },
    { href: "/despachador#cerrados", label: "Expedientes Cerrados", icon: History, badge: "CAD" },
    { href: "/despachador#entes", label: "Entes Registrados", icon: Users },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Panel de Mando y KPIs", icon: BarChart3 },
    { href: "/admin/reportes", label: "Reportes y Expedientes", icon: History },
    { href: "/admin/cint", label: "Consola CInt (LSV)", icon: Headphones },
    { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users, badge: "Admin" },
  ];

  const activeNavItems = isAdmin ? adminNav : role === "despachador" ? dispatcherNav : isOperator ? operatorNav : citizenNav;

  const roleLabel = isAdmin
    ? "Admin Global"
    : role === "despachador"
    ? "Despachador VEN 911"
    : role === "interprete_lsv"
    ? "Intérprete LSV"
    : isOperator
    ? "Operador PSAP"
    : "Solicitante";

  const isUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
  const userDisplayName = !isUuid(user.nombre_completo) && user.nombre_completo
    ? user.nombre_completo
    : (user.correo_electronico && !isUuid(user.correo_electronico)
        ? (user.correo_electronico.includes("@") ? user.correo_electronico.split("@")[0] : user.correo_electronico)
        : (isAdmin ? "Administrador SIAE" : role === "despachador" ? "Despachador VEN 911" : isOperator ? "Operador VEN 911" : "Solicitante"));

  return (
    <aside
      aria-label="Navegación principal del sistema"
      className={`hidden lg:flex flex-col shrink-0 fluent-sidebar z-30 transition-all duration-300 sticky top-0 h-screen ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header del Sidebar */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] font-black text-white shadow-md">
            S
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#32577a] dark:text-sky-400 truncate block">
                SIAE · VEN 911
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {isAdmin ? "Panel Administrador" : role === "despachador" ? "Consola Despacho" : isOperator ? "Consola Operativa" : "Portal Ciudadano"}
              </p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={collapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Info de Perfil y Rol */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-white shadow-xs ${
              isAdmin
                ? "bg-gradient-to-br from-[#163f66] to-[#1e5a8a]"
                : role === "despachador"
                ? "bg-[#102e4c]"
                : isOperator
                ? "bg-[#163f66]"
                : "bg-emerald-600"
            }`}
          >
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={userDisplayName}>
                {userDisplayName}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                  isAdmin
                    ? "bg-sky-50 text-[var(--accent)] border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800"
                    : role === "despachador"
                    ? "bg-sky-50/80 text-[var(--accent)] border-sky-200/80 dark:bg-slate-800 dark:text-sky-300 dark:border-slate-700"
                    : isOperator
                    ? "bg-sky-50 text-[var(--accent)] border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                }`}
              >
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botón SOS de Emergencia para Ciudadanos — fuente única de acción SOS */}
      {isCitizen && onTriggerSos && (
        <div className="px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={onTriggerSos}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer border border-red-500/40 ${
              collapsed ? "py-2.5 px-2" : "py-2.5 px-4 text-xs"
            }`}
            aria-label="Activar emergencia SOS"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {!collapsed && <span>ACTIVAR SOS</span>}
          </button>
        </div>
      )}

      {/* Lista de Navegación */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto" aria-label="Enlaces de navegación">
        {activeNavItems.map((item) => {
          const Icon = item.icon;
          const [itemBase, itemQuery] = item.href.split("?");
          const currentTab = activeTab;
          
          let isActive = false;
          if (itemBase === "/perfil") {
            const itemTab = new URLSearchParams(itemQuery || "").get("tab") || "medica";
            isActive = pathname === "/perfil" && currentTab === itemTab;
          } else if (item.href === "/") {
            isActive = pathname === "/";
          } else {
            isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                        item.badge === "P0"
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2 pb-6">
        <div className="flex items-center justify-between">
          <ThemeToggle showLabel={!collapsed} />
        </div>

        <button
          type="button"
          onClick={logoutCurrentSession}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
          aria-label="Cerrar sesión"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
