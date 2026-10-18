"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/auth-store";
import {
  useUsersStore,
  type SystemUserRole,
  type ManagedUser,
} from "@/src/modules/admin/users-store";
import { useJwtKeyRotation } from "@/src/features/admin-governance/hooks/useJwtKeyRotation";
import { useUserManagementForm } from "@/src/features/admin-governance/hooks/useUserManagementForm";
import { UsersTable } from "@/src/features/admin-governance/components/UsersTable";
import { CreateUserModal } from "@/src/features/admin-governance/components/CreateUserModal";
import { KeyRotationModal } from "@/src/features/admin-governance/components/KeyRotationModal";
import {
  ShieldAlert,
  Search,
  Trash2,
  Lock,
  Unlock,
  ArrowLeft,
  Filter,
  CheckCircle2,
  UserPlus,
  X,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  KeyRound,
} from "lucide-react";

const ROLES_LIST: SystemUserRole[] = [
  "solicitante",
  "operador",
  "despachador",
  "interprete_lsv",
  "supervisor",
  "admin",
];

export default function AdminUsersPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Guard reactivo en cliente: solo el rol admin puede acceder a la gestión de usuarios
  useEffect(() => {
    if (isAuthenticated && user && user.role !== "admin") {
      if (user.role === "operador" || user.role === "supervisor" || user.role === "despachador") {
        router.replace("/admin");
      } else if (user.role === "interprete_lsv") {
        router.replace("/admin/cint");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, router]);

  const {
    users,
    searchQuery,
    roleFilter,
    statusFilter,
    notice,
    isLoading,
    error,
    fetchUsers,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setNotice,
    blockUser,
    unblockUser,
    changeUserRole,
    deleteUser,
    addUser,
    updateUser,
  } = useUsersStore();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Hook de rotación criptográfica Ed25519
  const {
    showKeyModal,
    setShowKeyModal,
    currentKeyId,
    keyRotatedAt,
    rotatingKeys,
    rotationResult,
    handleRotateKey,
  } = useJwtKeyRotation();

  // Hook de formulario de alta y edición de funcionarios
  const {
    showCreateModal,
    setShowCreateModal,
    editingUser,
    submitting,
    showPassword,
    setShowPassword,
    newName,
    setNewName,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    newRole,
    setNewRole,
    newPhone,
    setNewPhone,
    newOrganismo,
    setNewOrganismo,
    newPlaca,
    setNewPlaca,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateUser,
  } = useUserManagementForm({ updateUser, addUser });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.correo_electronico.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "Todos" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "Todos" ||
      (statusFilter === "Activos" && u.status === "active") ||
      (statusFilter === "Bloqueados" && u.status === "blocked");

    return matchesQuery && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === "active").length;
  const blockedCount = users.filter((u) => u.status === "blocked").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  // Si el usuario está autenticado pero no es admin, mostrar pantalla de bloqueo y redirigir
  if (isAuthenticated && user && user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center" role="status" aria-live="polite">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mb-4 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acceso Restringido · Exclusivo Administrador</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Esta consola de gestión de identidades y credenciales es exclusiva de la administración global del PSAP. Redirigiendo a su consola autorizada...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 dark:text-white transition-colors pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Fluent */}
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 fluent-acrylic p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a Consola PSAP
              </Link>
              <span className="fluent-badge bg-sky-50 text-[var(--accent)] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Seguridad & Control Global
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión de Usuarios y Roles
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Administración centralizada de cuentas de ciudadanos, operadores VEN 911 y personal de comando.
              Permite registrar nuevos operadores y personal, suspender accesos no autorizados y revocar permisos con sincronización directa al backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2.5 text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs transition"
            >
              <KeyRound className="h-4 w-4" />
              Rotar Claves JWT
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              aria-label="+ Dar de alta funcionario institucional (+ Nuevo Operador / Usuario)"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 shadow-md transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              + Dar de alta funcionario institucional
            </button>
          </div>
        </header>

        {/* Métricas Fluent de Estado */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="fluent-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Usuarios Activos
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{activeCount}</p>
            <p className="mt-1 text-xs text-slate-500">Cuentas con acceso habilitado</p>
          </div>

          <div className="fluent-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cuentas Bloqueadas
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Lock className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-red-600 dark:text-red-400">{blockedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Accesos restringidos por seguridad</p>
          </div>

          <div className="fluent-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Administradores
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{adminCount}</p>
            <p className="mt-1 text-xs text-slate-500">Con privilegios de borrado y desbloqueo</p>
          </div>
        </section>

        {/* Notificación de Estado */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center justify-between rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 p-4 text-xs font-semibold text-[var(--accent)] dark:text-sky-300 shadow-sm"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-bold text-sky-800 dark:text-sky-200 hover:underline ml-4"
            >
              Cerrar
            </button>
          </div>
        )}
        {error && (
          <p className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {error}
          </p>
        )}

        {/* Controles de Búsqueda y Filtros */}
        <div className="mb-6 fluent-card p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, correo o ID de usuario..."
                aria-label="Buscar usuarios"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Filtro por Rol */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Rol:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filtrar por rol"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-2xs"
              >
                <option value="Todos">Todos los roles</option>
                <option value="solicitante">Solicitantes</option>
                <option value="operador">Operadores PSAP</option>
                <option value="despachador">Despachadores</option>
                <option value="interprete_lsv">Intérpretes LSV</option>
                <option value="supervisor">Supervisores</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por estado"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-2xs"
              >
                <option value="Todos">Todos</option>
                <option value="Activos">Solo Activos</option>
                <option value="Bloqueados">Solo Bloqueados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios Modularizada */}
        <UsersTable
          users={filteredUsers}
          isLoading={isLoading}
          rolesList={ROLES_LIST}
          confirmDeleteId={confirmDeleteId}
          onChangeRole={changeUserRole}
          onBlockUser={blockUser}
          onUnblockUser={unblockUser}
          onDeleteUser={deleteUser}
          onSetConfirmDeleteId={setConfirmDeleteId}
        />

        {/* Modal de Creación / Edición de Funcionario */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={closeModal}
          editingUser={editingUser}
          submitting={submitting}
          formError={formError}
          newName={newName}
          setNewName={setNewName}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          newRole={newRole}
          setNewRole={setNewRole}
          newPhone={newPhone}
          setNewPhone={setNewPhone}
          newOrganismo={newOrganismo}
          setNewOrganismo={setNewOrganismo}
          newPlaca={newPlaca}
          setNewPlaca={setNewPlaca}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onSubmit={handleCreateUser}
        />

        {/* Modal de Rotación de Claves Criptográficas Ed25519 */}
        <KeyRotationModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          currentKeyId={currentKeyId}
          keyRotatedAt={keyRotatedAt}
          rotatingKeys={rotatingKeys}
          rotationResult={rotationResult}
          onRotateKey={handleRotateKey}
        />
      </div>
    </div>
  );
}
