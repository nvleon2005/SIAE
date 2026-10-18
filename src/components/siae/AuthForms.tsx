"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  otpSchema,
  recoverySchema,
  registerSchema,
  type LoginFormValues,
  type OtpFormValues,
  type RecoveryFormValues,
  type RegisterFormValues,
} from "@/src/modules/auth/auth-schemas";

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  onUsePasskey: () => void;
  submitting?: boolean;
}

export function LoginForm({ onSubmit, onUsePasskey, submitting = false }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className={`space-y-4 ${hasErrors ? "animate-shake" : ""}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="login-email" className="field-label">Email</label>
        <input id="login-email" className="text-input" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} />
        {errors.email ? <p id="login-email-error" className="text-sm text-red-200" role="alert">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="login-password" className="field-label">Contraseña</label>
        <input id="login-password" className="text-input" type="password" {...register("password")} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} />
        {errors.password ? <p id="login-password-error" className="text-sm text-red-200" role="alert">{errors.password.message}</p> : null}
      </div>
      <button type="button" className="secondary-button" onClick={onUsePasskey}>Usar passkey</button>
      <button type="submit" className="primary-button" disabled={submitting || isSubmitting}>
        {submitting || isSubmitting ? "Iniciando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  submitting?: boolean;
}

export function RegisterForm({ onSubmit, submitting = false }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className={`space-y-4 ${hasErrors ? "animate-shake" : ""}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="register-name" className="field-label">Nombre</label>
        <input id="register-name" className="text-input" type="text" {...register("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "register-name-error" : undefined} />
        {errors.name ? <p id="register-name-error" className="text-sm text-red-200" role="alert">{errors.name.message}</p> : null}
      </div>
      <div>
        <label htmlFor="register-email" className="field-label">Email</label>
        <input id="register-email" className="text-input" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "register-email-error" : undefined} />
        {errors.email ? <p id="register-email-error" className="text-sm text-red-200" role="alert">{errors.email.message}</p> : null}
      </div>
      <div>
        <label htmlFor="register-phone" className="field-label">Teléfono</label>
        <input id="register-phone" className="text-input" type="tel" placeholder="04141234567" {...register("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "register-phone-error" : undefined} />
        {errors.phone ? <p id="register-phone-error" className="text-sm text-red-200" role="alert">{errors.phone.message}</p> : null}
      </div>
      <div>
        <label htmlFor="register-password" className="field-label">Contraseña</label>
        <input id="register-password" className="text-input" type="password" {...register("password")} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "register-password-error" : undefined} />
        {errors.password ? <p id="register-password-error" className="text-sm text-red-200" role="alert">{errors.password.message}</p> : null}
      </div>
      <div>
        <label htmlFor="register-confirm-password" className="field-label">Confirmar Contraseña</label>
        <input id="register-confirm-password" className="text-input" type="password" {...register("confirmPassword")} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined} />
        {errors.confirmPassword ? <p id="register-confirm-password-error" className="text-sm text-red-200" role="alert">{errors.confirmPassword.message}</p> : null}
      </div>
      <button type="submit" className="primary-button" disabled={submitting || isSubmitting}>
        {submitting || isSubmitting ? "Creando..." : "Crear cuenta"}
      </button>
    </form>
  );
}

interface RecoveryFormProps {
  onSubmit: (values: RecoveryFormValues) => void;
  submitting?: boolean;
}

export function RecoveryForm({ onSubmit, submitting = false }: RecoveryFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className={`space-y-4 ${hasErrors ? "animate-shake" : ""}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="recovery-email" className="field-label">Email</label>
        <input id="recovery-email" className="text-input" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "recovery-email-error" : undefined} />
        {errors.email ? <p id="recovery-email-error" className="text-sm text-red-200" role="alert">{errors.email.message}</p> : null}
      </div>
      <button type="submit" className="primary-button" disabled={submitting || isSubmitting}>
        {submitting || isSubmitting ? "Enviando..." : "Recuperar cuenta"}
      </button>
    </form>
  );
}

interface OtpFormProps {
  onSubmit: (values: OtpFormValues) => void;
  submitting?: boolean;
}

export function OtpForm({ onSubmit, submitting = false }: OtpFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="otp-code" className="field-label">Código de verificación</label>
        <input id="otp-code" className="text-input" inputMode="numeric" maxLength={6} {...register("code")} aria-invalid={Boolean(errors.code)} aria-describedby={errors.code ? "otp-code-error" : undefined} />
        {errors.code ? <p id="otp-code-error" className="text-sm text-red-200" role="alert">{errors.code.message}</p> : null}
      </div>
      <button type="submit" className="primary-button" disabled={submitting || isSubmitting}>
        {submitting || isSubmitting ? "Verificando..." : "Verificar"}
      </button>
    </form>
  );
}
