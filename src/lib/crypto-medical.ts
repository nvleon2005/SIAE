/**
 * Módulo de cifrado AES-256-GCM para datos médicos sensibles (RGPD Art. 9).
 *
 * Flujo:
 * 1. Frontend genera una clave AES-256-GCM derivada de un passphrase del usuario
 * 2. Los datos médicos se cifran ANTES de enviarse al backend
 * 3. El backend almacena el blob cifrado en `datos_medicos_cifrados BYTEA`
 * 4. Solo el cliente puede descifrar con su passphrase
 *
 * El passphrase NUNCA se envía al servidor.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100_000;

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra un string con AES-256-GCM.
 * Retorna un string Base64 con formato: salt:iv:ciphertext
 */
export async function encryptAES(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  // Empaquetar salt + iv + ciphertext en un solo string Base64
  const packed = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, SALT_LENGTH);
  packed.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return toBase64(packed.buffer);
}

/**
 * Descifra un string cifrado con AES-256-GCM.
 * El input debe ser el formato salt:iv:ciphertext en Base64.
 */
export async function decryptAES(encryptedBase64: string, passphrase: string): Promise<string> {
  const packed = fromBase64(encryptedBase64);

  const salt = packed.slice(0, SALT_LENGTH);
  const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = packed.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Cifra el objeto de datos médicos completo como JSON.
 */
export async function encryptMedicalData(
  data: {
    tipoSangre: string;
    alergias: string[];
    condicionesMedicas: string[];
    medicamentos: string[];
  },
  passphrase: string
): Promise<string> {
  const json = JSON.stringify(data);
  return encryptAES(json, passphrase);
}

/**
 * Descifra un blob de datos médicos y retorna el objeto original.
 */
export async function decryptMedicalData<T = Record<string, unknown>>(
  encryptedBase64: string,
  passphrase: string
): Promise<T> {
  const json = await decryptAES(encryptedBase64, passphrase);
  return JSON.parse(json) as T;
}
