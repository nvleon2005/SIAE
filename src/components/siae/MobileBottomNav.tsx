"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Shield, History, User, Settings, LogIn } from "lucide-react";
import { useDeviceContext } from "@/src/hooks/use-device-context";
import { useAuth } from "@/src/modules/auth/auth-store";

interface MobileBottomNavProps {
  isAnonymous?: boolean;
}

export function MobileBottomNav({ isAnonymous = false }: MobileBottomNavProps) {
  let pathname = "";
  try {
    pathname = typeof usePathname === "function" ? usePathname() ?? "" : "";
  } catch {
    pathname = "";
  }
  const device = useDeviceContext();
  const { user, isAuthenticated } = useAuth();

  // En navegadores de escritorio estándar (no standalone), la navegación principal es el portal superior
  if (device.isMounted && device.isDesktop && !device.isStandalone) {
    return null;
  }

  // Ocultar la barra inferior durante salas de videollamada activa para no interferir con los controles
  if (pathname.startsWith("/sala")) {
    return null;
  }

  const isUserLoggedIn = isAuthenticated || Boolean(user) || !isAnonymous;

  const navItems = [
    {
      href: "/",
      label: "SOS",
      icon: ShieldAlert,
      isActive: pathname === "/",
      emergency: true,
    },
    {
      href: "/camino-seguro",
      label: "Camino",
      icon: Shield,
      isActive: pathname.startsWith("/camino-seguro"),
    },
    {
      href: "/historial",
      label: "Historial",
      icon: History,
      isActive: pathname.startsWith("/historial"),
    },
    {
      href: isUserLoggedIn ? "/perfil" : "/login",
      label: isUserLoggedIn ? "Perfil" : "Ingresar",
      icon: isUserLoggedIn ? User : LogIn,
      isActive: pathname.startsWith("/perfil") || pathname.startsWith("/login"),
    },
    {
      href: "/ajustes",
      label: "Ajustes",
      icon: Settings,
      isActive: pathname.startsWith("/ajustes"),
    },
  ];

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = item.isActive
            ? item.emergency
              ? "text-red-400 font-bold"
              : "text-cyan-400 font-bold"
            : "text-slate-400 hover:text-slate-200 font-medium";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors cursor-pointer select-none ${activeClass}`}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-xl transition-all ${
                  item.isActive
                    ? item.emergency
                      ? "bg-red-500/20 ring-1 ring-red-500/50"
                      : "bg-cyan-500/20 ring-1 ring-cyan-500/50"
                    : "hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    item.emergency && item.isActive
                      ? "animate-pulse text-red-500"
                      : item.isActive
                        ? "text-cyan-400"
                        : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
              </div>
              <span className="mt-0.5 tracking-tight text-xs leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
