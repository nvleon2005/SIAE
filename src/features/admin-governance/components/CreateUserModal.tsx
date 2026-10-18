import React, { useState } from "react";
import { UserPlus, Pencil, ShieldAlert, X, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { SystemUserRole, ManagedUser } from "@/src/modules/admin/users-store";

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: ManagedUser | null;
  submitting: boolean;
  formError: string | null;
  newName: string;
  setNewName: (val: string) => void;
  newEmail: string;
  setNewEmail: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (val: string) => void;
  showConfirmPassword?: boolean;
  setShowConfirmPassword?: (val: boolean) => void;
  newRole: SystemUserRole;
  setNewRole: (val: SystemUserRole) => void;
  newPhone: string;
  setNewPhone: (val: string) => void;
  newOrganismo: string;
  setNewOrganismo: (val: string) => void;
  newPlaca: string;
  setNewPlaca: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  editingUser,
  submitting,
  formError,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  confirmPassword = "",
  setConfirmPassword,
  showConfirmPassword = false,
  setShowConfirmPassword,
  newRole,
  setNewRole,
  newPhone,
  setNewPhone,
  newOrganismo,
  setNewOrganismo,
  newPlaca,
  setNewPlaca,
  showPassword,
  setShowPassword,
  onSubmit,
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {editingUser ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="create-user-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {editingUser
                  ? "Editar Datos de Funcionario"
                  : "Registrar Operador o Usuario · Dar de alta funcionario institucional (VEN 911)"}
              </h2>
              <p className="text-xs text-slate-500">
                Aprovisionamiento oficial centralizado de operadores, despachadores y supervisores
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banner de Doctrina VEN 911 */}
        {!editingUser && (
          <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/80 dark:border-cyan-900/60 dark:bg-cyan-950/40 p-3 text-xs text-cyan-900 dark:text-cyan-200">
            <p className="font-bold flex items-center gap-1.5 text-cyan-950 dark:text-cyan-100">
              <ShieldAlert className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              Doctrina Operativa VEN 911 (Segregación de Cuentas)
            </p>
            <p className="text-[11px] mt-0.5 text-cyan-800 dark:text-cyan-300 leading-relaxed">
              El personal operativo no se auto-registra por la web ciudadana. Todo funcionario de sala o despacho es aprovisionado y auditado aquí.
            </p>
          </div>
        )}

        {formError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 dark:text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-user-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Rango
              </label>
              <input
                id="new-user-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. TSU Carlos Mendoza"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label htmlFor="new-user-placa" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Identificador / Placa / Puesto
              </label>
              <input
                id="new-user-placa"
                type="text"
                value={newPlaca}
                onChange={(e) => setNewPlaca(e.target.value)}
                placeholder="Ej. Operador 14 / Placa 4012"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-user-organismo" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organismo / Ente de Mando
              </label>
              <select
                id="new-user-organismo"
                value={newOrganismo}
                onChange={(e) => setNewOrganismo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="VEN 911 Monagas (Comando Central Maturín)">VEN 911 Monagas (Comando Central)</option>
                <option value="Policía Nacional Bolivariana (PNB)">Policía Nacional Bolivariana (PNB)</option>
                <option value="Cuerpo de Bomberos del Estado Monagas">Bomberos del Estado Monagas</option>
                <option value="Protección Civil y Administración de Desastres">Protección Civil (PC)</option>
              </select>
            </div>

            <div>
              <label htmlFor="new-user-role" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rol Operativo Asignado
              </label>
              <select
                id="new-user-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as SystemUserRole)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="operador">Operador PSAP (Atención y Triaje)</option>
                <option value="despachador">Despachador CAD (Despachador Unidades y Articulación de Entes)</option>
                <option value="interprete_lsv">Intérprete CINT (Lengua de Señas LSV)</option>
                <option value="supervisor">Supervisor de Guardia VEN 911</option>
                <option value="admin">Administrador Global de Plataforma</option>
                <option value="solicitante">Alertante Institucional Especial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-user-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico Institucional
              </label>
              <input
                id="new-user-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nombre.apellido@ven911.gob.ve"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label htmlFor="new-user-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Sala / Flota
              </label>
              <input
                id="new-user-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+58 412 1234567"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {!editingUser && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primer Input: Contraseña Temporal */}
                <div>
                  <label htmlFor="new-user-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña Temporal Inicial
                  </label>
                  <div className="relative">
                    <input
                      id="new-user-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2 pl-3.5 pr-10 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Segundo Input: Confirmar Contraseña */}
                <div>
                  <label htmlFor="new-user-confirm-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="new-user-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword?.(e.target.value)}
                      placeholder="Repita la contraseña"
                      className={`w-full rounded-xl border ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                          : confirmPassword && newPassword === confirmPassword
                          ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                      } bg-slate-50 dark:bg-slate-950 py-2 pl-3.5 pr-10 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword?.(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicadores de Validación en Tiempo Real */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Debe tener al menos 6 caracteres
                  </span>
                )}
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Las contraseñas coinciden
                  </span>
                )}
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Las contraseñas no coinciden
                  </span>
                )}
                <span className="text-[10px] text-slate-400 ml-auto">
                  El funcionario deberá actualizar su credencial al iniciar guardia.
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || (!editingUser && (newPassword.length < 6 || !confirmPassword || newPassword !== confirmPassword))}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear en Backend"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
