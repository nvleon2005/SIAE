export interface DevMockUser {
  password: string;
  role: string;
  nombre: string;
  id: string;
}

const INITIAL_DEV_USERS: Record<string, DevMockUser> = {
  "admin@siae.gob.ve": {
    password: "admin123",
    role: "admin",
    nombre: "Administrador SIAE",
    id: "usr-admin-01",
  },
  "carlos.mendoza@ven911.gob.ve": {
    password: "operador123",
    role: "operator",
    nombre: "Carlos Mendoza (Operador 14)",
    id: "usr-operador-14",
  },
  "operador@siae.gob.ve": {
    password: "operador123",
    role: "operator",
    nombre: "Operador 14 (Triaje PSAP)",
    id: "usr-operador-01",
  },
  "despachador@siae.gob.ve": {
    password: "despachador123",
    role: "dispatcher",
    nombre: "Despachador CAD VEN 911",
    id: "usr-despachador-01",
  },
  "despachador@ven911.gob.ve": {
    password: "despachador123",
    role: "dispatcher",
    nombre: "Tte. Marcos Pérez (Despachador CAD)",
    id: "usr-despachador-02",
  },
  "elena.rondon@cint.gob.ve": {
    password: "cint123",
    role: "operator",
    nombre: "Elena Rondón (Intérprete LSV)",
    id: "usr-interprete-01",
  },
  "elena.duarte@cint.ven911.gob.ve": {
    password: "cint123",
    role: "operator",
    nombre: "Elena Duarte (Intérprete CINT LSV)",
    id: "usr-interprete-02",
  },
  "maria@ejemplo.com": {
    password: "ciudadano123",
    role: "user",
    nombre: "María López",
    id: "usr-solicitante-01",
  },
};

// Global in-memory storage for development sessions
const globalForDevUsers = globalThis as unknown as {
  __siaeDevMockUsers?: Map<string, DevMockUser>;
};

if (!globalForDevUsers.__siaeDevMockUsers) {
  globalForDevUsers.__siaeDevMockUsers = new Map(Object.entries(INITIAL_DEV_USERS));
}

export const devMockUsersStore = globalForDevUsers.__siaeDevMockUsers;

export function findDevMockUser(email: string): DevMockUser | undefined {
  return devMockUsersStore.get(email.trim().toLowerCase());
}

export function saveDevMockUser(email: string, user: DevMockUser): void {
  devMockUsersStore.set(email.trim().toLowerCase(), user);
}
