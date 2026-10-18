"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/auth-store";
import { OperatorAcdStation } from "@/src/components/siae/OperatorAcdStation";

// Roles autorizados para la consola de triaje y atención ACD
const OPERATOR_ROLES = new Set(["operador", "operator", "supervisor", "admin"]);

export default function OperadorPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Guard de rol: un despachador no debe brincar a la consola del operador
  useEffect(() => {
    if (isAuthenticated && user && !OPERATOR_ROLES.has(user.role ?? "")) {
      router.replace(user.role === "despachador" || user.role === "dispatcher" ? "/despachador" : "/");
    }
  }, [isAuthenticated, user, router]);

  return <OperatorAcdStation />;
}
