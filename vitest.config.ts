import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "**/node_modules/**", "Grpc/**", ".next/**"],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname ?? "."),
    },
  },
});
