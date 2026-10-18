/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare global {
  interface ImportMetaEnv {
    readonly NEXT_PUBLIC_API_BASE: string;
    readonly NEXT_PUBLIC_VAPID_KEY: string;
    readonly NEXT_PUBLIC_LIVEKIT_URL: string;
    readonly NEXT_PUBLIC_MOCK_MODE: "on" | "off";
  }

  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
  }
}

export {};
