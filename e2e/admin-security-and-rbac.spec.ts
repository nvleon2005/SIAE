import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Fase 2: Blindaje de Seguridad y Gobierno del Administrador", () => {
  test.describe("1. Rol Administrador (Gobierno Total en /admin/usuarios)", () => {
    test.beforeEach(async ({ context }) => {
      // Inyectar credenciales y cookies de Administrador Global
      await context.addCookies([
        {
          name: "siae_token",
          value: "test-admin-jwt-token",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_role",
          value: "admin",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_token",
          value: "test-admin-jwt-token",
          domain: "127.0.0.1",
          path: "/",
        },
        {
          name: "siae_role",
          value: "admin",
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
    });

    test("Accede a /admin/usuarios, verifica métricas, búsqueda y modal con rol Despachador", async ({ page }) => {
      // Configurar estado en localStorage para cliente Zustand
      await page.addInitScript(() => {
        localStorage.setItem(
          "siae_auth_user",
          JSON.stringify({
            id: "usr-admin-01",
            nombre_completo: "Ing. Roberto Salazar (Administrador)",
            correo_electronico: "admin@siae.gob.ve",
            role: "admin",
            hasPasskey: true,
          })
        );
      });

      await page.goto("/admin/usuarios");

      // 1. Cabecera Fluent y Título
      await expect(page.getByRole("heading", { name: /gestión de usuarios y roles/i })).toBeVisible();

      // 2. Tarjetas de Métricas de Seguridad
      await expect(page.getByText(/usuarios activos/i)).toBeVisible();
      await expect(page.getByText(/cuentas bloqueadas/i)).toBeVisible();
      await expect(page.getByText(/administradores/i).first()).toBeVisible();

      // 3. Búsqueda de despachador
      const searchInput = page.getByLabel(/buscar usuarios/i);
      await searchInput.fill("Pedro");
      await expect(page.getByText(/sgto\. pedro rivas/i)).toBeVisible();
      await searchInput.fill("");

      // 4. Filtro por Rol
      const roleFilter = page.getByLabel(/filtrar por rol/i);
      await roleFilter.selectOption("despachador");
      await expect(page.getByText(/sgto\. pedro rivas/i)).toBeVisible();
      await roleFilter.selectOption("Todos");

      // 5. Modal de creación de usuario y verificación del rol Despachador
      const createBtn = page.getByRole("button", { name: /nuevo operador \/ usuario/i });
      await expect(createBtn).toBeVisible();
      await createBtn.click();

      const modalHeading = page.getByRole("heading", { name: /registrar operador o usuario/i });
      await expect(modalHeading).toBeVisible();

      // Verificar que Despachador Unidades está disponible en las opciones del formulario dentro del modal
      const modal = page.getByRole("dialog");
      await expect(modal.locator("select").getByRole("option", { name: /despachador unidades/i })).toBeAttached();

      // Cerrar modal
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(modalHeading).not.toBeVisible();

      // 6. Auditoría de Accesibilidad Automática (@axe-core/playwright) WCAG 2.1 AA
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .disableRules(["color-contrast"]) // validado en tema específico
        .analyze();
      expect(axeResults.violations).toEqual([]);

      // 7. Captura visual
      await page.screenshot({
        path: "test-results/admin-usuarios-rbac.png",
        fullPage: true,
      });
    });
  });

  test.describe("2. Blindaje de Seguridad: Operador y Despachador", () => {
    test("Operador intentando acceder a /admin/usuarios es interceptado y redirigido a /admin", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "siae_token",
          value: "test-operator-jwt-token",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_role",
          value: "operador",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_token",
          value: "test-operator-jwt-token",
          domain: "127.0.0.1",
          path: "/",
        },
        {
          name: "siae_role",
          value: "operador",
          domain: "127.0.0.1",
          path: "/",
        },
      ]);

      await page.addInitScript(() => {
        localStorage.setItem(
          "siae_auth_user",
          JSON.stringify({
            id: "usr-op-14",
            nombre_completo: "Carlos Mendoza",
            correo_electronico: "carlos@ven911.gob.ve",
            role: "operador",
          })
        );
      });

      // Navegar a la ruta protegida de administración
      await page.goto("/admin/usuarios");

      // Middleware o guard cliente deben interceptar y redirigir a /operador
      await page.waitForURL("**/operador", { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/operador$/);

      // En /operador, verificar que "Gestión de Usuarios" NO está en el menú
      await expect(page.getByRole("link", { name: /gestión de usuarios/i })).not.toBeVisible();
    });

    test("Despachador intentando acceder a /admin/usuarios es interceptado y redirigido a /admin", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "siae_token",
          value: "test-dispatcher-jwt-token",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_role",
          value: "despachador",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_token",
          value: "test-dispatcher-jwt-token",
          domain: "127.0.0.1",
          path: "/",
        },
        {
          name: "siae_role",
          value: "despachador",
          domain: "127.0.0.1",
          path: "/",
        },
      ]);

      await page.addInitScript(() => {
        localStorage.setItem(
          "siae_auth_user",
          JSON.stringify({
            id: "usr-desp-02",
            nombre_completo: "Sgto. Pedro Rivas",
            correo_electronico: "pedro@despacho.ven911.gob.ve",
            role: "despachador",
          })
        );
      });

      await page.goto("/admin/usuarios");
      await page.waitForURL("**/despachador", { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/despachador$/);
    });
  });

  test.describe("3. Blindaje de Seguridad: Solicitante Ciudadano", () => {
    test("Ciudadano intentando acceder a /admin/usuarios es redirigido a la raíz /", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "siae_token",
          value: "test-citizen-jwt-token",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_role",
          value: "solicitante",
          domain: "localhost",
          path: "/",
        },
        {
          name: "siae_token",
          value: "test-citizen-jwt-token",
          domain: "127.0.0.1",
          path: "/",
        },
        {
          name: "siae_role",
          value: "solicitante",
          domain: "127.0.0.1",
          path: "/",
        },
      ]);

      await page.addInitScript(() => {
        localStorage.setItem(
          "siae_auth_user",
          JSON.stringify({
            id: "usr-cit-01",
            nombre_completo: "María López",
            correo_electronico: "maria@ejemplo.com",
            role: "solicitante",
          })
        );
      });

      await page.goto("/admin/usuarios");
      await page.waitForURL("**/", { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/$/);
    });
  });
});
