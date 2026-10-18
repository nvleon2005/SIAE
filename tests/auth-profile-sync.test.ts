import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUser, registerUser, logoutCurrentSession, restoreSession, useAuth } from "@/src/modules/auth/auth-store";
import {
  toRemoteProfile,
  fromRemoteProfile,
  syncProfileWithBackend,
  fetchRemoteProfile,
  saveRemoteProfile,
} from "@/src/modules/profile/profile-sync";
import {
  clearProfileStore,
  defaultLocalProfile,
  readProfileFromDb,
  saveProfileToDb,
  type LocalProfileRecord,
} from "@/src/lib/profile-db";
import { useProfile } from "@/src/modules/profile/profile-store";

describe("INT-6: Autenticación y Sincronización de Perfil", () => {
  beforeEach(async () => {
    useAuth.getState().clearSession();
    useProfile.setState({ profile: null, error: null, syncing: false, syncedAt: null });
    await clearProfileStore();
    vi.restoreAllMocks();
  });

  describe("Autenticación y Sesión Segura", () => {
    it("inicia sesión correctamente, guarda la sesión y devuelve los datos del usuario", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "jwt-test-token",
            user: {
              id: "user-10",
              correo_electronico: "ana@ejemplo.com",
              nombre_completo: "Ana García",
              hasPasskey: false,
              role: "solicitante",
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": "siae_session=cookie-val; HttpOnly; SameSite=Lax",
            },
          }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const user = await loginUser("ana@ejemplo.com", "CorrectPassword123!");

      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/auth/login",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: expect.stringContaining("ana@ejemplo.com"),
        })
      );
      expect(user.id).toBe("user-10");
      expect(user.correo_electronico).toBe("ana@ejemplo.com");
      expect(useAuth.getState().isAuthenticated).toBe(true);
      expect(useAuth.getState().user?.nombre_completo).toBe("Ana García");
    });

    it("rechaza el inicio de sesión con credenciales inválidas y maneja el error", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "credenciales_invalidas", message: "Credenciales incorrectas" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(loginUser("ana@ejemplo.com", "wrong")).rejects.toThrow("Credenciales incorrectas");
      expect(useAuth.getState().isAuthenticated).toBe(false);
    });

    it("registra un usuario nuevo inyectando x-idempotency-key y estableciendo la sesión", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "user-new-123",
            user: {
              id: "user-new-123",
              correo_electronico: "carlos@ejemplo.com",
              nombre_completo: "Carlos Gómez",
              hasPasskey: false,
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const registered = await registerUser("Carlos Gómez", "carlos@ejemplo.com", "SecurePassword123!");

      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-idempotency-key": expect.any(String),
          }),
        })
      );
      expect(registered.correo_electronico).toBe("carlos@ejemplo.com");
      expect(useAuth.getState().isAuthenticated).toBe(true);
    });

    it("cierra la sesión, limpia las cookies y vuelve a modo anónimo", () => {
      useAuth.getState().setSession({
        id: "user-1",
        correo_electronico: "ana@ejemplo.com",
        nombre_completo: "Ana",
      });

      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      vi.stubGlobal("fetch", fetchMock);

      logoutCurrentSession();

      expect(useAuth.getState().isAuthenticated).toBe(false);
      expect(useAuth.getState().user).toBeNull();
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/auth/logout",
        expect.objectContaining({ method: "POST", credentials: "include" })
      );
    });

    it("restaura la sesión activa desde /v1/auth/session", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            user: {
              id: "user-restored",
              correo_electronico: "restored@ejemplo.com",
              nombre_completo: "Usuario Restaurado",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const ok = await restoreSession();
      expect(ok).toBe(true);
      expect(useAuth.getState().isAuthenticated).toBe(true);
      expect(useAuth.getState().user?.nombre_completo).toBe("Usuario Restaurado");
    });
  });

  describe("Mapeo y Normalización de Perfil (Local Dexie ↔ Remoto PostgreSQL)", () => {
    it("transforma un perfil local en el payload contractual de actualización", () => {
      const local: LocalProfileRecord = {
        ...defaultLocalProfile,
        name: "Beatriz Ramos",
        preferredLocale: "ca",
        disabilities: ["deaf"],
        channels: ["rtt", "video"],
        preferredSignLanguage: "lsc",
        fontScale: 1.5,
        theme: "high_contrast",
        reducedMotion: true,
        pictogramsOnly: true,
        longPressSeconds: 3,
        addresses: [{ id: "a1", label: "Casa", value: "Av. Bolívar c/c Calle Monagas, Maturín" }],
        emergencyContacts: [{ id: "c1", name: "David", phone: "+584140011223", relation: "Hermano" }],
      };

      const remote = toRemoteProfile(local);

      expect(remote.display_name).toBe("Beatriz Ramos");
      expect(remote.preferred_locale).toBe("ca");
      expect(remote.disabilities).toEqual(["deaf"]);
      expect(remote.preferred_channels).toEqual(["rtt", "video"]);
      expect(remote.preferred_sign_language).toBe("lsc");
      expect(remote.accessibility_settings).toEqual({
        font_scale: 1.5,
        theme: "high_contrast",
        reduced_motion: true,
        pictograms_only: true,
        long_press_seconds: 3,
      });
      expect(remote.addresses[0]).toEqual({
        id: "a1",
        label: "Casa",
        address_text: "Av. Bolívar c/c Calle Monagas, Maturín",
      });
      expect(remote.emergency_contacts[0]).toEqual({
        id: "c1",
        name: "David",
        phone: "+584140011223",
        relation: "Hermano",
      });
    });

    it("normaliza una respuesta remota con campos contractuales y anidados", () => {
      const rawRemote = {
        id: "remote-uuid-1",
        display_name: "Elena Ruiz",
        preferred_locale: "es",
        disabilities: ["motor"],
        preferred_channels: ["voice", "rtt"],
        accessibility_settings: {
          font_scale: 2,
          theme: "dark",
          reduced_motion: true,
          pictograms_only: false,
          long_press_seconds: 0,
        },
        addresses: [{ id: "addr-1", label: "Trabajo", address_text: "Paseo de Gracia 25" }],
        emergency_contacts: [{ id: "contact-1", name: "Sonia", phone: "+34699887766", relation: "Madre" }],
        updated_at: "2026-09-04T10:00:00Z",
      };

      const local = fromRemoteProfile(rawRemote, defaultLocalProfile);

      expect(local.remoteId).toBe("remote-uuid-1");
      expect(local.name).toBe("Elena Ruiz");
      expect(local.preferredLocale).toBe("es");
      expect(local.disabilities).toEqual(["motor"]);
      expect(local.channels).toEqual(["voz", "rtt"]);
      expect(local.fontScale).toBe(2);
      expect(local.theme).toBe("dark");
      expect(local.reducedMotion).toBe(true);
      expect(local.pictogramsOnly).toBe(false);
      expect(local.longPressSeconds).toBe(0);
      expect(local.addresses[0]).toEqual({ id: "addr-1", label: "Trabajo", value: "Paseo de Gracia 25" });
      expect(local.emergencyContacts[0]).toEqual({ id: "contact-1", name: "Sonia", phone: "+34699887766", relation: "Madre" });
      expect(local.isAnonymous).toBe(false);
    });
  });

  describe("Sincronización Bidireccional de Perfil", () => {
    it("no sincroniza con el backend cuando el usuario está en modo anónimo", async () => {
      useAuth.getState().clearSession();
      const res = await syncProfileWithBackend();
      expect(res.success).toBe(false);
      expect(res.error).toContain("no autenticado");
    });

    it("descarga el perfil del servidor y actualiza la base de datos IndexedDB si el usuario está autenticado", async () => {
      useAuth.getState().setSession({
        id: "user-1",
        correo_electronico: "maria@ejemplo.com",
        nombre_completo: "María",
      });

      await saveProfileToDb({
        ...defaultLocalProfile,
        name: "María Local",
      });

      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "user-1",
            display_name: "María Remota Actualizada",
            preferred_locale: "gl",
            disabilities: ["blind"],
            preferred_channels: ["voz"],
            accessibility_settings: {
              font_scale: 1.8,
              theme: "high_contrast",
              reduced_motion: false,
              pictograms_only: true,
              long_press_seconds: 1,
            },
            addresses: [],
            emergency_contacts: [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const res = await syncProfileWithBackend();

      expect(res.success).toBe(true);
      expect(res.profile?.name).toBe("María Remota Actualizada");
      expect(res.profile?.preferredLocale).toBe("gl");
      expect(res.profile?.fontScale).toBe(1.8);
      expect(res.profile?.theme).toBe("high_contrast");

      // Verify persistence in local db
      const fromDb = await readProfileFromDb();
      expect(fromDb?.name).toBe("María Remota Actualizada");
      expect(fromDb?.preferredLocale).toBe("gl");
    });

    it("obtiene el perfil remoto directamente mediante fetchRemoteProfile", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "user-remote-123",
            display_name: "Remoto Directo",
            preferred_locale: "es",
            disabilities: [],
            preferred_channels: ["rtt"],
            addresses: [],
            emergency_contacts: [],
            accessibility_settings: { font_scale: 1, theme: "light" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const remote = await fetchRemoteProfile();
      expect(remote?.display_name).toBe("Remoto Directo");
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/perfiles/me",
        expect.objectContaining({ method: "GET", credentials: "include" })
      );
    });

    it("guarda el perfil remoto enviando x-idempotency-key a /v1/perfiles/me", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      vi.stubGlobal("fetch", fetchMock);

      const ok = await saveRemoteProfile(defaultLocalProfile);
      expect(ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/perfiles/me",
        expect.objectContaining({
          method: "PUT",
          credentials: "include",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-idempotency-key": expect.any(String),
          }),
        })
      );
    });

    it("actualiza useProfile y sincroniza en segundo plano cuando el usuario está autenticado", async () => {
      useAuth.getState().setSession({
        id: "user-1",
        correo_electronico: "maria@ejemplo.com",
        nombre_completo: "María",
      });

      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      vi.stubGlobal("fetch", fetchMock);

      await useProfile.getState().update({
        name: "María Nueva",
        fontScale: 2.2,
      });

      expect(useProfile.getState().profile?.name).toBe("María Nueva");
      expect(useProfile.getState().profile?.fontScale).toBe(2.2);

      // Verify remote update was triggered
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/perfiles/me",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("María Nueva"),
        })
      );
    });
  });
});
