export function mapBackendRoleToFrontend(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":      return "admin";
    case "operator":   return "operador";
    case "dispatcher": return "despachador";
    case "user":       return "solicitante";
    default:           return role;
  }
}

export function mapFrontendRoleToBackend(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":         return "admin";
    case "operador":
    case "supervisor":
    case "interprete_lsv": return "operator";
    case "despachador":   return "dispatcher";
    case "solicitante":   return "user";
    default:              return "user";
  }
}
