import { z } from "zod";
import {
  sanitizeInput,
  hasSqlInjectionRisk,
  hasXssRisk,
  hasAccents,
  hasSpecialCharsInName,
  STRICT_EMAIL_PATTERN,
} from "@/src/lib/security";

export const loginSchema = z.object({
  email: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z
        .string()
        .min(1, "El correo o identificador es obligatorio.")
        .max(100, "El identificador no puede exceder 100 caracteres.")
        .refine((val) => !hasSqlInjectionRisk(val), {
          message: "Se han detectado caracteres o palabras reservadas no permitidas (anti-inyección).",
        })
        .refine((val) => !hasXssRisk(val), {
          message: "No se permiten etiquetas HTML o secuencias de script.",
        })
        .refine(
          (val) => STRICT_EMAIL_PATTERN.test(val) || /^[a-zA-Z0-9._-]{3,30}$/.test(val),
          {
            message: "Introduce un correo electrónico o nombre de usuario válido.",
          }
        )
    ),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(128, "La contraseña no puede exceder 128 caracteres.")
    .refine((val) => !hasXssRisk(val), {
      message: "Formato de contraseña no válido.",
    }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(80, "El nombre no puede exceder 80 caracteres.")
        .refine((val) => !hasAccents(val), {
          message: "El nombre no debe contener acentos ni tildes (ej: use Maria en vez de María).",
        })
        .refine((val) => !hasSpecialCharsInName(val), {
          message: "El nombre no debe contener caracteres especiales (solo letras de la A a la Z y espacios).",
        })
        .refine((val) => !hasSqlInjectionRisk(val), {
          message: "El nombre contiene caracteres especiales no válidos.",
        })
        .refine((val) => !hasXssRisk(val), {
          message: "No se permiten etiquetas o scripts en el nombre.",
        })
    ),
  email: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z
        .string()
        .min(1, "El correo electrónico es obligatorio.")
        .max(100, "El correo no puede exceder 100 caracteres.")
        .refine((val) => !hasAccents(val), {
          message: "El correo no debe contener acentos ni tildes.",
        })
        .refine((val) => !hasSqlInjectionRisk(val), {
          message: "El correo contiene caracteres no permitidos.",
        })
        .refine((val) => !hasXssRisk(val), {
          message: "No se permiten etiquetas HTML en el correo.",
        })
        .refine((val) => STRICT_EMAIL_PATTERN.test(val), {
          message: "Introduce una dirección de correo electrónico válida (ej: usuario@siae.gob.ve).",
        })
    ),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Ingresa un teléfono válido, ej. 04141234567 o +584141234567"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede exceder 128 caracteres.")
    .refine((val) => !hasAccents(val), {
      message: "La contraseña no debe contener acentos ni tildes.",
    })
    .refine((val) => !hasXssRisk(val), {
      message: "Formato de contraseña no válido.",
    }),
  confirmPassword: z
    .string()
    .min(1, "Confirma tu contraseña."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export const recoverySchema = z.object({
  email: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z
        .string()
        .min(1, "Introduce tu correo para recuperar la cuenta.")
        .max(100, "El correo no puede exceder 100 caracteres.")
        .refine((val) => !hasSqlInjectionRisk(val) && !hasXssRisk(val), {
          message: "Formato de correo no válido.",
        })
        .refine((val) => STRICT_EMAIL_PATTERN.test(val), {
          message: "Introduce un correo válido para el restablecimiento.",
        })
    ),
});

export const otpSchema = z.object({
  code: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z
        .string()
        .regex(/^\d{6}$/, "El código debe contener exactamente 6 dígitos numéricos.")
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RecoveryFormValues = z.infer<typeof recoverySchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
