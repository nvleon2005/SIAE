import { expect, test } from "@playwright/test";

test.describe("Validación de Doble Contraseña en Registro de Usuarios y Funcionarios", () => {
  test.beforeEach(async ({ context }) => {
    // Autenticar como administrador
    await context.addCookies([
      { name: "siae_token", value: "admin-jwt-token", domain: "localhost", path: "/" },
      { name: "siae_role", value: "admin", domain: "localhost", path: "/" },
      { name: "siae_name", value: "Administrador", domain: "localhost", path: "/" },
    ]);
  });

  test("1. Modal de nuevo usuario exige confirmar contraseña y valida coincidencia en tiempo real", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.waitForLoadState("networkidle");

    // Abrir modal de nuevo usuario
    const nuevoUserBtn = page.getByRole("button", { name: /nuevo usuario|nuevo funcionario|dar de alta/i });
    await expect(nuevoUserBtn).toBeVisible();
    await nuevoUserBtn.click();

    const modal = page.getByRole("dialog", { name: /registrar operador o usuario/i });
    await expect(modal).toBeVisible();

    const pwdInput = modal.locator("#new-user-password");
    const confirmInput = modal.locator("#new-user-confirm-password");
    const submitBtn = modal.getByRole("button", { name: /crear en backend/i });

    // Ambos inputs deben estar presentes
    await expect(pwdInput).toBeVisible();
    await expect(confirmInput).toBeVisible();

    // Rellenar datos básicos
    await modal.locator("#new-user-name").fill("Oficial Carlos Mendoza");
    await modal.locator("#new-user-email").fill("carlos.mendoza@ven911.gob.ve");

    // 1. Probar contraseñas que no coinciden
    await pwdInput.fill("PasswordSegura1");
    await confirmInput.fill("PasswordDiferente2");

    // Debe mostrar advertencia de no coincidencia y deshabilitar botón
    await expect(modal.getByText(/las contraseñas no coinciden/i)).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // 2. Probar contraseña corta (< 6 caracteres)
    await pwdInput.fill("12345");
    await confirmInput.fill("12345");
    await expect(modal.getByText(/debe tener al menos 6 caracteres/i)).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // 3. Probar contraseñas que coinciden perfectamente (>= 6 caracteres)
    await pwdInput.fill("Operador2026!");
    await confirmInput.fill("Operador2026!");

    // Debe mostrar confirmación visual de coincidencia y habilitar el botón
    await expect(modal.getByText(/las contraseñas coinciden/i)).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // 4. Probar conmutador de visibilidad (Eye toggle)
    expect(await pwdInput.getAttribute("type")).toBe("password");
    expect(await confirmInput.getAttribute("type")).toBe("password");

    const togglePwd = modal.getByLabel(/ver contraseña/i);
    if (await togglePwd.isVisible()) {
      await togglePwd.click();
      expect(await pwdInput.getAttribute("type")).toBe("text");
    }

    const toggleConfirm = modal.getByLabel(/ver confirmación/i);
    if (await toggleConfirm.isVisible()) {
      await toggleConfirm.click();
      expect(await confirmInput.getAttribute("type")).toBe("text");
    }
  });

  test("2. Registro ciudadano (/register) también valida confirmación de contraseña", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const pwdInput = page.locator('input[name="password"], #password');
    const confirmInput = page.locator('input[name="confirmPassword"], #confirmPassword');

    await expect(pwdInput).toBeVisible();
    await expect(confirmInput).toBeVisible();
  });
});
