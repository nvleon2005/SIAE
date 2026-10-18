import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const scriptSource = isDevelopment ? "'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:" : "'self' 'wasm-unsafe-eval' blob:";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.arasaac.org", pathname: "/**" },
      { protocol: "https", hostname: "static.arasaac.org", pathname: "/**" },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8050";
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        // Salas: ruta especial con alias
        {
          source: "/v1/salas/:id/unirse",
          destination: `${backendUrl}/v1/salas/:id/join`,
        },
        // Gateway general hacia el backend API gRPC / HTTP
        {
          source: "/v1/:path*",
          destination: `${backendUrl}/v1/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.arasaac.org https://static.arasaac.org https://tiles.openfreemap.org; font-src 'self' data:; connect-src 'self' http://127.0.0.1:8080 http://localhost:8080 ws://127.0.0.1:8080 ws://localhost:8080 ws://127.0.0.1:7880 ws://localhost:7880 https://api.arasaac.org https://static.arasaac.org https://tiles.openfreemap.org wss://*.livekit.cloud; worker-src 'self' blob:; child-src 'self' blob:; manifest-src 'self'`,
          },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self), usb=()" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
