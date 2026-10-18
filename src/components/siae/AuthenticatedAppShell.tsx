"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/modules/auth/auth-store";
import { AppSidebarNavigation } from "@/src/components/siae/AppSidebarNavigation";
import { useEmergency } from "@/src/modules/emergency/emergency-store";

interface AuthenticatedAppShellProps {
  children: React.ReactNode;
}

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  const { isAuthenticated, user } = useAuth();
  const startActivation = useEmergency((state) => state.startActivation);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before mounting on client, render identical markup
  if (!mounted || !isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col lg:flex-row">
      <AppSidebarNavigation onTriggerSos={() => startActivation()} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
