"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MedicalWizard } from "@/src/components/siae/MedicalWizard";
import {
  clearProfileStore,
  defaultLocalProfile,
  exportProfileJson,
  type LocalProfileRecord,
} from "@/src/lib/profile-db";
import { useProfile } from "@/src/modules/profile/profile-store";
import { useAuth } from "@/src/modules/auth/auth-store";
import { Toast } from "@/src/components/siae/Toast";
import { AuthenticatedAppShell } from "@/src/components/siae/AuthenticatedAppShell";
import { ProfileHeader } from "@/src/features/citizen-profile/components/ProfileHeader";
import { ProfileTabNav } from "@/src/features/citizen-profile/components/ProfileTabNav";
import { ProfileAddressesTab } from "@/src/features/citizen-profile/components/ProfileAddressesTab";
import { ProfileUserTab } from "@/src/features/citizen-profile/components/ProfileUserTab";
import { ProfileAccessibilityTab } from "@/src/features/citizen-profile/components/ProfileAccessibilityTab";
import { ProfileTab } from "@/src/features/citizen-profile/types";

export type { ProfileTab };

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab") as ProfileTab | null;
  const validTabs: ProfileTab[] = ["medica", "usuario", "domicilios", "accesibilidad"];
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    validTabs.includes(initialTabParam as ProfileTab) ? (initialTabParam as ProfileTab) : "medica"
  );

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.replace(`/perfil?tab=${tab}`, { scroll: false });
  };

  const profile = useProfile((state) => state.profile) ?? defaultLocalProfile;
  const syncing = useProfile((state) => state.syncing);
  const loadProfile = useProfile((state) => state.load);
  const updateProfile = useProfile((state) => state.update);
  const syncWithBackend = useProfile((state) => state.syncWithBackend);
  const resetAccessibility = useProfile((state) => state.resetAccessibility);
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: "success" | "info" } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Si el perfil local tiene nombre vacío, correo o UUID, y el usuario tiene nombre real, actualizar
  useEffect(() => {
    const isEmailOrUuid = (v?: string) => Boolean(v && (v.includes("@") || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(v)));
    if (user?.nombre_completo && !isEmailOrUuid(user.nombre_completo)) {
      if (!profile.name || isEmailOrUuid(profile.name)) {
        void updateProfile({ name: user.nombre_completo });
      }
    }
  }, [user?.nombre_completo, profile.name, updateProfile]);

  // Sincronizar tab si cambia el searchParam externamente
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ProfileTab | null;
    if (validTabs.includes(tabParam as ProfileTab)) {
      setActiveTab(tabParam as ProfileTab);
    }
  }, [searchParams]);

  const updateField = (
    field: keyof LocalProfileRecord,
    value: unknown
  ) => {
    void updateProfile({ [field]: value } as Partial<LocalProfileRecord>);
  };

  const handleExportProfile = async () => {
    await exportProfileJson(profile);
    setToastMessage({
      title: "Datos Exportados",
      message: "Se ha descargado la copia segura de tu perfil médico y de emergencia.",
      type: "success",
    });
  };

  const handleDeleteAllData = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente todos tus datos de este dispositivo? Esta acción borrará domicilios, contactos, fichas médicas y apoyos.")) {
      return;
    }
    await clearProfileStore();
    void loadProfile();
    setToastMessage({
      title: "Datos Eliminados",
      message: "Se han borrado todos tus datos locales de este dispositivo conforme a la ley.",
      type: "info",
    });
  };

  const handleResetAccessibility = () => {
    void resetAccessibility();
    setToastMessage({
      title: "Accesibilidad Restablecida",
      message: "Se han recuperado los valores predeterminados de visualización y movimiento.",
      type: "info",
    });
  };

  return (
    <AuthenticatedAppShell>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-6 px-3 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Header con breadcrumbs, sincronización VEN 911, selector multiusuario y exportar */}
          <ProfileHeader
            activeTab={activeTab}
            mounted={mounted}
            isAuthenticated={isAuthenticated}
            syncing={syncing}
            onSync={() => void syncWithBackend()}
            onExport={handleExportProfile}
          />

          {/* Barra de pestañas estructurales */}
          <ProfileTabNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            profile={profile}
          />

          {/* Panel 1: Ficha Médica y Apoyos */}
          {activeTab === "medica" && (
            <div
              role="tabpanel"
              id="panel-medica"
              aria-labelledby="tab-medica"
              className="py-4"
            >
              <MedicalWizard />
            </div>
          )}

          {/* Panel 2: Domicilios y Contactos */}
          {activeTab === "domicilios" && (
            <ProfileAddressesTab
              profile={profile}
              updateProfile={updateProfile}
              onDeleteAllData={handleDeleteAllData}
            />
          )}

          {/* Panel 3: Datos de la Cuenta y Privacidad */}
          {activeTab === "usuario" && (
            <ProfileUserTab
              profile={profile}
              user={user}
              onUpdateField={(field, val) => updateField(field, val)}
              onDeleteAllData={handleDeleteAllData}
            />
          )}

          {/* Panel 4: Accesibilidad de Pantalla */}
          {activeTab === "accesibilidad" && (
            <ProfileAccessibilityTab
              profile={profile}
              onUpdateField={(field, val) => updateField(field, val)}
              onResetAccessibility={handleResetAccessibility}
            />
          )}
        </div>
      </main>

      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </AuthenticatedAppShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] dark:bg-slate-950 p-6 flex items-center justify-center text-sm text-slate-500 font-semibold">
          Cargando ficha médica y perfil...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
