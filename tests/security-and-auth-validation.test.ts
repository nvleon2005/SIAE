import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  hasSqlInjectionRisk,
  hasXssRisk,
  evaluatePasswordStrength,
} from "@/src/lib/security";
import { loginSchema, registerSchema } from "@/src/modules/auth/auth-schemas";

describe("Seguridad y Sanitización de Formularios SIAE", () => {
  describe("Sanitización de Strings", () => {
    it("elimina null bytes y caracteres de control invisibles", () => {
      const dirty = "maria\0@ejemplo.com\u0007   ";
      const clean = sanitizeInput(dirty);
      expect(clean).toBe("maria@ejemplo.com");
    });
  });

  describe("Detección de Inyección SQL (Anti-SQLi)", () => {
    it("detecta payloads clásicos de inyección SQL", () => {
      expect(hasSqlInjectionRisk("admin' OR '1'='1")).toBe(true);
      expect(hasSqlInjectionRisk("user'; DROP TABLE users; --")).toBe(true);
      expect(hasSqlInjectionRisk("SELECT * FROM personas")).toBe(true);
      expect(hasSqlInjectionRisk("maria@siae.gob.ve")).toBe(false);
      expect(hasSqlInjectionRisk("carlos_operador")).toBe(false);
    });

    it("bloquea el esquema Zod de login si contiene SQL injection", () => {
      const result = loginSchema.safeParse({
        email: "admin' OR '1'='1",
        password: "PasswordValido123!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("anti-inyección");
      }
    });
  });

  describe("Detección de Inyección de Scripts (Anti-XSS)", () => {
    it("detecta scripts o etiquetas HTML en los campos", () => {
      expect(hasXssRisk("<script>alert('xss')</script>")).toBe(true);
      expect(hasXssRisk("javascript:void(0)")).toBe(true);
      expect(hasXssRisk('<img src="x" onerror="alert(1)">')).toBe(true);
      expect(hasXssRisk("Maria Elena Lopez")).toBe(false);
    });

    it("bloquea el esquema Zod de registro si el nombre contiene script", () => {
      const result = registerSchema.safeParse({
        name: "<script>alert(1)</script>",
        email: "maria@ejemplo.com",
        password: "PasswordFuerte123!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Validación de Acentos y Caracteres Especiales en Registro", () => {
    it("rechaza nombres con acentos o tildes (á, é, í, ó, ú, etc.)", () => {
      const testNames = ["María López", "José González", "Andrés Martínez", "Ángel Peña"];
      for (const name of testNames) {
        const result = registerSchema.safeParse({
          name,
          email: "usuario@siae.gob.ve",
          password: "PasswordSegura123!",
          confirmPassword: "PasswordSegura123!",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((i) => i.message.includes("acentos") || i.message.includes("caracteres especiales"))).toBe(true);
        }
      }
    });

    it("rechaza nombres con caracteres especiales o números", () => {
      const invalidNames = ["Maria_Lopez", "Carlos123", "Pedro#Gomez", "Ana@Maturin"];
      for (const name of invalidNames) {
        const result = registerSchema.safeParse({
          name,
          email: "usuario@siae.gob.ve",
          phone: "04141234567",
          password: "PasswordSegura123!",
          confirmPassword: "PasswordSegura123!",
        });
        expect(result.success).toBe(false);
      }
    });

    it("acepta nombres válidos sin acentos y con solo letras y espacios", () => {
      const validNames = ["Maria Elena Lopez", "Carlos Mendoza", "Elena Rondon", "Roberto Silva"];
      for (const name of validNames) {
        const result = registerSchema.safeParse({
          name,
          email: "usuario@siae.gob.ve",
          phone: "04141234567",
          password: "PasswordSegura123!",
          confirmPassword: "PasswordSegura123!",
        });
        expect(result.success).toBe(true);
      }
    });

    it("rechaza contraseñas o correos con acentos", () => {
      const resultEmail = registerSchema.safeParse({
        name: "Maria Lopez",
        email: "maría@ejemplo.com",
        phone: "04141234567",
        password: "PasswordSegura123!",
      });
      expect(resultEmail.success).toBe(false);

      const resultPass = registerSchema.safeParse({
        name: "Maria Lopez",
        email: "maria@ejemplo.com",
        phone: "04141234567",
        password: "ContraseñaSegura123!",
      });
      expect(resultPass.success).toBe(false);
    });
  });

  describe("Validación de Contraseñas y Entropía", () => {
    it("califica contraseñas triviales o cortas como débiles", () => {
      const evaluation = evaluatePasswordStrength("12345678");
      expect(evaluation.score).toBeLessThanOrEqual(1);
      expect(evaluation.label).toMatch(/Débil/i);
    });

    it("califica contraseñas robustas con alta entropía", () => {
      const evaluation = evaluatePasswordStrength("V3n911_M4turin#Seguro");
      expect(evaluation.score).toBeGreaterThanOrEqual(3);
      expect(["Fuerte", "Muy Fuerte"]).toContain(evaluation.label);
    });
  });
});
