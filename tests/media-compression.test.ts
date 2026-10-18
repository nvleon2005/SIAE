import { describe, it, expect } from "vitest";
import { compressEvidenceImage, detectMultimediaCapabilities } from "@/src/lib/media-compression";

describe("Optimización Multimedia y Compresión de Evidencias (SIAE — VEN 911)", () => {
  it("detecta capacidades multimedia, códecs WebRTC y exportación WebP", () => {
    const report = detectMultimediaCapabilities();
    expect(report).toBeDefined();
    expect(report.recommendedVideoBitrateKbps).toBe(450);
    expect(typeof report.webrtcSupported).toBe("boolean");
    expect(typeof report.webSocketSupported).toBe("boolean");
  });

  it("no devuelve una compresión inventada cuando Canvas API no está disponible", async () => {
    const svgDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="%23ff0000"/></svg>`;
    await expect(compressEvidenceImage(svgDataUrl, {
      maxWidth: 640,
      maxHeight: 480,
      quality: 0.8,
    })).rejects.toThrow("La compresión de imágenes requiere un navegador con Canvas API.");
  });
});
