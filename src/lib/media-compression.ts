/**
 * SIAE - Módulo de Optimización, Códecs y Compresión Multimedia (VEN 911)
 *
 * Diseñado para garantizar máxima compatibilidad y mínimo consumo de ancho de banda
 * en redes móviles venezolanas (2G / 3G / 4G / Cantv satelital).
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number; // Porcentaje de reducción (ej. 85%)
  width: number;
  height: number;
  format: string;
}

/**
 * Comprime y redimensiona una imagen en el cliente utilizando Canvas API.
 * Reduce el peso de imágenes pesadas de cámara (5-12 MB) a < 150 KB manteniendo legibilidad forense.
 */
export async function compressEvidenceImage(
  imageSource: File | Blob | string,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.75,
    mimeType = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    const isJsdom = typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");
    if (typeof window === "undefined" || typeof document === "undefined" || isJsdom) {
      return reject(new Error("La compresión de imágenes requiere un navegador con Canvas API."));
    }

    const img = new Image();
    let originalSize = 0;

    if (typeof imageSource === "string") {
      img.src = imageSource;
      originalSize = Math.round((imageSource.length * 3) / 4);
    } else {
      originalSize = imageSource.size;
      img.src = URL.createObjectURL(imageSource);
    }

    img.onload = () => {
      // Liberar URL de objeto si fue creada
      if (typeof imageSource !== "string") {
        URL.revokeObjectURL(img.src);
      }

      let targetWidth = img.width;
      let targetHeight = img.height;

      // Calcular escala conservando relación de aspecto
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        return reject(new Error("No se pudo obtener el contexto 2D del Canvas"));
      }

      // Aplicar filtro de nitidez y renderizado de alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Intentar exportar a WebP con fallback a JPEG
      let finalDataUrl = "";
      let actualFormat = mimeType;

      try {
        finalDataUrl = canvas.toDataURL(mimeType, quality);
        // Algunos navegadores antiguos retornan PNG si no soportan WebP en toDataURL
        if (mimeType === "image/webp" && !finalDataUrl.startsWith("data:image/webp")) {
          finalDataUrl = canvas.toDataURL("image/jpeg", quality);
          actualFormat = "image/jpeg";
        }
      } catch {
        finalDataUrl = canvas.toDataURL("image/jpeg", quality);
        actualFormat = "image/jpeg";
      }

      const compressedSize = Math.round((finalDataUrl.length * 3) / 4);
      const ratio = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

      resolve({
        dataUrl: finalDataUrl,
        originalSizeBytes: originalSize,
        compressedSizeBytes: compressedSize,
        compressionRatio: Math.max(0, ratio),
        width: targetWidth,
        height: targetHeight,
        format: actualFormat,
      });
    };

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen para compresión"));
    };
  });
}

/**
 * Diagnóstico de capacidades multimedia y códecs soportados en el navegador local.
 */
export interface MultimediaCapabilityReport {
  webrtcSupported: boolean;
  webSocketSupported: boolean;
  codecs: {
    audioOpus: boolean;
    videoVp8: boolean;
    videoVp9: boolean;
    videoH264: boolean;
    videoAv1: boolean;
  };
  formats: {
    webpExport: boolean;
    canvasOffscreen: boolean;
  };
  recommendedVideoBitrateKbps: number;
}

export function detectMultimediaCapabilities(): MultimediaCapabilityReport {
  if (typeof window === "undefined") {
    return {
      webrtcSupported: false,
      webSocketSupported: false,
      codecs: { audioOpus: false, videoVp8: false, videoVp9: false, videoH264: false, videoAv1: false },
      formats: { webpExport: false, canvasOffscreen: false },
      recommendedVideoBitrateKbps: 300,
    };
  }

  const webrtcSupported = typeof window.RTCPeerConnection !== "undefined" && typeof navigator.mediaDevices !== "undefined";
  const webSocketSupported = typeof window.WebSocket !== "undefined";

  // Comprobar soporte de MediaRecorder / MediaSource codecs
  const checkVideoCodec = (type: string): boolean => {
    if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
      return MediaRecorder.isTypeSupported(type);
    }
    const video = document.createElement("video");
    return Boolean(video.canPlayType(type));
  };

  const checkAudioCodec = (type: string): boolean => {
    const audio = document.createElement("audio");
    return Boolean(audio.canPlayType(type));
  };

  // Probar exportación WebP en Canvas
  let webpExport = false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpExport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpExport = false;
  }

  return {
    webrtcSupported,
    webSocketSupported,
    codecs: {
      audioOpus: checkAudioCodec('audio/ogg; codecs="opus"') || checkAudioCodec('audio/webm; codecs="opus"'),
      videoVp8: checkVideoCodec('video/webm; codecs="vp8"'),
      videoVp9: checkVideoCodec('video/webm; codecs="vp9"'),
      videoH264: checkVideoCodec('video/mp4; codecs="avc1.42E01E"') || checkVideoCodec('video/webm; codecs="h264"'),
      videoAv1: checkVideoCodec('video/webm; codecs="av01.0.08M.08"'),
    },
    formats: {
      webpExport,
      canvasOffscreen: typeof window.OffscreenCanvas !== "undefined",
    },
    // En redes venezolanas sugerimos 350-500 kbps para video VP8 a 480p/24fps
    recommendedVideoBitrateKbps: 450,
  };
}
