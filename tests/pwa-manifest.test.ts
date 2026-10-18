import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("SPRINT-12 PWA", () => {
  it("declara un manifest instalable con shortcuts y assets existentes", async () => {
    const manifest = JSON.parse(await readFile(resolve(process.cwd(), "public/manifest.webmanifest"), "utf8")) as {
      name: string;
      start_url: string;
      scope: string;
      display: string;
      icons: Array<{ src: string; sizes: string }>;
      shortcuts: Array<{ url: string; icons: Array<{ src: string }> }>;
    };

    expect(manifest.name).toContain("SIAE");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icons/icon-192.svg", sizes: "192x192" }),
      expect.objectContaining({ src: "/icons/icon-512.svg", sizes: "512x512" }),
    ]));
    expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual(expect.arrayContaining([
      "/?action=emergency",
      "/camino-seguro",
    ]));
  });

  it("incluye el handler de push y el fallback de navegación", async () => {
    const serviceWorker = await readFile(resolve(process.cwd(), "public/sw.js"), "utf8");

    expect(serviceWorker).toContain('addEventListener("push"');
    expect(serviceWorker).toContain('addEventListener("notificationclick"');
    expect(serviceWorker).toContain('"/offline"');
  });
});
