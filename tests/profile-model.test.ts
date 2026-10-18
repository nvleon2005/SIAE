import { canAddEmergencyContact, clearProfileStore, readProfileFromDb, saveProfileToDb, type LocalProfileRecord } from "@/src/lib/profile-db";

describe("modelo local de perfil", () => {
  beforeEach(async () => {
    await clearProfileStore();
  });

  it("migra perfiles antiguos y conserva campos contractuales por defecto", async () => {
    const legacyProfile = {
      id: "local",
      name: "Ana",
      channels: ["rtt"],
      hasCompletedOnboarding: true,
      locationAllowed: false,
      fontScale: 1,
      theme: "light",
      reducedMotion: false,
      pictogramsOnly: false,
      longPressSeconds: 1,
      addresses: [],
      emergencyContacts: [],
      updatedAt: new Date().toISOString(),
    } as unknown as LocalProfileRecord;
    await saveProfileToDb(legacyProfile);

    const profile = await readProfileFromDb();
    expect(profile).toMatchObject({
      name: "Ana",
      remoteId: null,
      version: 1,
      preferredLocale: "es",
      disabilities: [],
      privacy: { shareProfileOnEmergency: true },
    });
  });

  it("limita los contactos de emergencia a cinco", () => {
    expect(canAddEmergencyContact(4)).toBe(true);
    expect(canAddEmergencyContact(5)).toBe(false);
    expect(canAddEmergencyContact(6)).toBe(false);
  });
});