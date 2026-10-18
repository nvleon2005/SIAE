import React from "react";
import { Loader2, Lock, Unlock, Trash2 } from "lucide-react";
import { ManagedUser, SystemUserRole } from "@/src/modules/admin/users-store";

export interface UsersTableProps {
  users: ManagedUser[];
  isLoading: boolean;
  rolesList: SystemUserRole[];
  confirmDeleteId: string | null;
  onChangeRole: (userId: string, newRole: SystemUserRole) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onSetConfirmDeleteId: (id: string | null) => void;
}

export function UsersTable({
  users,
  isLoading,
  rolesList,
  confirmDeleteId,
  onChangeRole,
  onBlockUser,
  onUnblockUser,
  onDeleteUser,
  onSetConfirmDeleteId,
}: UsersTableProps) {
  return (
    <div className="fluent-card overflow-hidden">
      {isLoading && (
        <div className="flex items-center justify-center p-4 text-xs font-medium text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
          <Loader2 className="h-4 w-4 animate-spin mr-2 text-cyan-600" />
          Sincronizando usuarios con backend...
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Usuario / Identidad</th>
              <th className="py-3.5 px-4">Rol Asignado</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Fecha Creación</th>
              <th className="py-3.5 px-4 text-right">Acciones de Seguridad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    user.status === "blocked" ? "bg-red-50/30 dark:bg-red-950/10" : ""
                  }`}
                >
                  {/* Usuario / Identidad */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs ${
                          user.role === "admin"
                            ? "bg-purple-600"
                            : user.role === "operador"
                            ? "bg-cyan-600"
                            : user.role === "despachador"
                            ? "bg-indigo-600"
                            : user.role === "interprete_lsv"
                            ? "bg-amber-600"
                            : "bg-[var(--accent)]"
                        }`}
                      >
                        {user.nombre_completo.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {user.nombre_completo}
                        </p>
                        <p className="font-mono text-slate-500 dark:text-slate-400">
                          {user.correo_electronico}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {user.id.slice(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => onChangeRole(user.id, e.target.value as SystemUserRole)}
                      aria-label={`Cambiar rol de ${user.nombre_completo}`}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none shadow-2xs"
                    >
                      {rolesList.map((r) => (
                        <option key={r} value={r}>
                          {r === "solicitante"
                            ? "Solicitante"
                            : r === "operador"
                            ? "Operador PSAP"
                            : r === "despachador"
                            ? "Despachador Unidades"
                            : r === "interprete_lsv"
                            ? "Intérprete LSV"
                            : r === "supervisor"
                            ? "Supervisor"
                            : "Administrador"}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    {user.status === "active" ? (
                      <span className="fluent-badge bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activo
                      </span>
                    ) : (
                      <span className="fluent-badge bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                        <Lock className="h-3 w-3 text-red-500" />
                        Bloqueado
                      </span>
                    )}
                  </td>

                  {/* Último Acceso / Fecha Creación */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {user.creado_el || "Sin registro"}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón Bloquear / Desbloquear */}
                      {user.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => onBlockUser(user.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                          aria-label={`Bloquear acceso a ${user.nombre_completo}`}
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Bloquear
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUnblockUser(user.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                          aria-label={`Desbloquear acceso a ${user.nombre_completo}`}
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Desbloquear
                        </button>
                      )}

                      {/* Botón Eliminar */}
                      {confirmDeleteId === user.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteUser(user.id);
                              onSetConfirmDeleteId(null);
                            }}
                            className="rounded-xl bg-red-600 px-2.5 py-1.5 font-bold text-white hover:bg-red-700 transition cursor-pointer"
                            aria-label={`Confirmar eliminación definitiva de ${user.nombre_completo}`}
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetConfirmDeleteId(null)}
                            className="rounded-xl border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSetConfirmDeleteId(user.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          aria-label={`Eliminar cuenta de ${user.nombre_completo}`}
                          title="Eliminar cuenta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No se encontraron usuarios con los criterios de búsqueda aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
