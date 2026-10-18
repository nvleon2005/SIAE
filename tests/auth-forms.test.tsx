import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm, RegisterForm, RecoveryForm, OtpForm } from "@/src/components/siae/AuthForms";

describe("formularios de autenticación", () => {
  it("valida email y contraseña en login", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} onUsePasskey={vi.fn()} />);

    await user.type(screen.getByLabelText("Email"), "no-es-email");
    await user.type(screen.getByLabelText("Contraseña"), "123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts[0]).toHaveTextContent(/email válido|contraseña/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida nombre, email y contraseña en registro", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nombre"), "A");
    await user.type(screen.getByLabelText("Email"), "ana@ejemplo.com");
    await user.type(screen.getByLabelText("Contraseña"), "short");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts[0]).toHaveTextContent(/al menos 2 caracteres|al menos 12 caracteres/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida el código OTP de 6 dígitos", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OtpForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Código de verificación"), "12");
    await user.click(screen.getByRole("button", { name: "Verificar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/6 dígitos/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("acepta un email válido para recuperar la cuenta", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RecoveryForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "maria@ejemplo.com");
    await user.click(screen.getByRole("button", { name: "Recuperar cuenta" }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "maria@ejemplo.com" }, expect.anything());
  });
});
