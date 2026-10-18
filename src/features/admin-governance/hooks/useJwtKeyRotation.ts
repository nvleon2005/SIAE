import { useState, useCallback } from "react";

export function useJwtKeyRotation() {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [currentKeyId, setCurrentKeyId] = useState<string | null>(null);
  const [keyRotatedAt, setKeyRotatedAt] = useState<string | null>(null);
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [rotationResult, setRotationResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRotateKey = useCallback(async () => {
    setRotatingKeys(true);
    setRotationResult(null);
    try {
      const res = await fetch("/v1/admin/keys/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Rotación administrativa periódica por Administrador Global" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentKeyId(typeof data.key?.kid === "string" ? data.key.kid : null);
        setKeyRotatedAt(typeof data.key?.rotatedAt === "string" ? data.key.rotatedAt : null);
        setRotationResult({ success: true, message: data.message });
      } else {
        setRotationResult({ success: false, message: data.error || "Fallo en la rotación" });
      }
    } catch {
      setRotationResult({ success: false, message: "Error de red al contactar servicio de claves" });
    } finally {
      setRotatingKeys(false);
    }
  }, []);

  return {
    showKeyModal,
    setShowKeyModal,
    currentKeyId,
    keyRotatedAt,
    rotatingKeys,
    rotationResult,
    handleRotateKey,
  };
}
