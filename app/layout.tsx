import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { AppProviders } from "@/src/components/providers/AppProviders";
import { AccessibilityBootstrap } from "@/src/components/providers/AccessibilityBootstrap";
import { PwaInstallBanner } from "@/src/components/siae/PwaInstallBanner";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIAE",
  description: "Sistema Inclusivo de Atencion a Emergencias",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#D32F2F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${atkinson.variable} font-sans`} suppressHydrationWarning>
        <AccessibilityBootstrap />
        <AppProviders>
          {children}
          <PwaInstallBanner />
        </AppProviders>
      </body>
    </html>
  );
}