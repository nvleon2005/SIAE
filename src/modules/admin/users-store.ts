import { create } from "zustand";

export type SystemUserRole = "solicitante" | "operador" | "despachador" | "admin" | "supervisor" | "interprete_lsv";
export type SystemUserStatus = "active" | "blocked" | "pending";

export interface ManagedUser {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  role: SystemUserRole;
  status: SystemUserStatus;
  telefono?: string;
  discapacidad?: string;
  ultimo_acceso?: string;
  creado_el: string;
}

export interface NewUserData {
  nombre_completo: string;
  correo_electronico: string;
  password?: string;
  role: SystemUserRole;
  telefono?: string;
  discapacidad?: string;
}

interface UsersState {
  users: ManagedUser[];
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  notice: string | null;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setNotice: (notice: string | null) => void;
  fetchUsers: () => Promise<void>;
  blockUser: (id: string) => Promise<boolean>;
  unblockUser: (id: string) => Promise<boolean>;
  changeUserRole: (id: string, newRole: SystemUserRole) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  addUser: (user: NewUserData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, data: { nombre_completo: string; correo_electronico: string }) => Promise<{ success: boolean; error?: string }>;
}

function parseManagedUser(value: unknown): ManagedUser {
  if (typeof value !== "object" || value === null) {
    throw new Error("El servidor devolvió un usuario con formato inválido.");
  }
  const user = value as Record<string, unknown>;
  if (
    typeof user.id !== "string" ||
    typeof user.nombre_completo !== "string" ||
    typeof user.correo_electronico !== "string" ||
    typeof user.role !== "string" ||
    typeof user.status !== "string"
  ) {
    throw new Error("El servidor devolvió un usuario incompleto.");
  }
  return {
    id: user.id,
    nombre_completo: user.nombre_completo,
    correo_electronico: user.correo_electronico,
    role: user.role as SystemUserRole,
    status: user.status as SystemUserStatus,
    telefono: typeof user.telefono === "string" ? user.telefono : undefined,
    discapacidad: typeof user.discapacidad === "string" ? user.discapacidad : undefined,
    ultimo_acceso: typeof user.ultimo_acceso === "string" ? user.ultimo_acceso : undefined,
    creado_el: typeof user.creado_el === "string" ? user.creado_el.split("T")[0] : "",
  };
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  searchQuery: "",
  roleFilter: "Todos",
  statusFilter: "Todos",
  notice: null,
  isLoading: false,
  error: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRoleFilter: (roleFilter) => set({ roleFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setNotice: (notice) => set({ notice }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/v1/admin/usuarios");
      const data = await res.json().catch(() => null) as { usuarios?: unknown } | null;
      if (!res.ok) throw new Error(`No se pudieron cargar los usuarios (${res.status}).`);
      if (!Array.isArray(data?.usuarios)) {
        throw new Error("El servidor devolvió una lista de usuarios inválida.");
      }
      set({ users: data.usuarios.map(parseManagedUser), isLoading: false });
    } catch (fetchError) {
      set({
        users: [],
        isLoading: false,
        error: fetchError instanceof Error ? fetchError.message : "No se pudieron cargar los usuarios.",
      });
    }
  },

  blockUser: async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/usuarios/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "blocked" }),
      });
      if (!res.ok) throw new Error(`No se pudo bloquear el usuario (${res.status}).`);
      await get().fetchUsers();
      set({ notice: `Usuario ${id} bloqueado en el backend.` });
      return true;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "No se pudo bloquear el usuario.";
      set({ notice: message });
      return false;
    }
  },

  unblockUser: async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/usuarios/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error(`No se pudo desbloquear el usuario (${res.status}).`);
      await get().fetchUsers();
      set({ notice: `Acceso de ${id} restaurado en el backend.` });
      return true;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "No se pudo desbloquear el usuario.";
      set({ notice: message });
      return false;
    }
  },

  changeUserRole: async (id: string, newRole: SystemUserRole) => {
    try {
      const res = await fetch(`/v1/admin/usuarios/${encodeURIComponent(id)}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error(`No se pudo cambiar el rol (${res.status}).`);
      await get().fetchUsers();
      set({ notice: `Rol de ${id} actualizado en el backend.` });
      return true;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "No se pudo cambiar el rol.";
      set({ notice: message });
      return false;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/usuarios/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`No se pudo eliminar el usuario (${res.status}).`);
      await get().fetchUsers();
      set({ notice: `Usuario ${id} eliminado en el backend.` });
      return true;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "No se pudo eliminar el usuario.";
      set({ notice: message });
      return false;
    }
  },


  addUser: async (data: NewUserData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/v1/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: data.nombre_completo,
          username: data.correo_electronico,
          correo_electronico: data.correo_electronico,
          password: data.password,
          role: data.role,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        set({ isLoading: false, notice: `Error: ${resData.error || "No se pudo crear el usuario"}` });
        return { success: false, error: resData.error || "Error al crear usuario" };
      }
      await get().fetchUsers();
      set({ isLoading: false, notice: `Usuario ${data.nombre_completo} creado en el backend.` });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de red al crear usuario";
      set({ isLoading: false, notice: msg });
      return { success: false, error: msg };
    }
  },

  updateUser: async (id: string, data: { nombre_completo: string; correo_electronico: string }) => {
    try {
      const res = await fetch(`/v1/admin/usuarios/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: data.nombre_completo,
          correo_electronico: data.correo_electronico,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        set({ notice: `Error al actualizar: ${resData.error || "No se pudo actualizar el perfil"}` });
        return { success: false, error: resData.error || "Error al actualizar perfil" };
      }

      await get().fetchUsers();
      set({ notice: `Perfil de ${data.nombre_completo} actualizado en el backend.` });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de red al actualizar usuario";
      set({ notice: msg });
      return { success: false, error: msg };
    }
  },

}));
