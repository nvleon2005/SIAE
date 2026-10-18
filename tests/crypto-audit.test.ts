import { afterEach, describe, expect, it, vi } from "vitest";
import { computeSha256 } from "@/src/lib/crypto-audit";

describe("computeSha256", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the SHA-256 digest for the provided input", async () => {
    await expect(computeSha256("")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("fails explicitly when Web Crypto is unavailable", async () => {
    vi.stubGlobal("crypto", {});

    await expect(computeSha256("SIAE")).rejects.toThrow(
      "Web Crypto API is required",
    );
  });
});
