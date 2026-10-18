"use client";

import { useEffect, useState } from "react";

export interface DeviceContextState {
  isMounted: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  hasGps: boolean;
}

export function useDeviceContext(): DeviceContextState {
  const [state, setState] = useState<DeviceContextState>({
    isMounted: false,
    isStandalone: false,
    isMobile: false,
    isDesktop: true,
    hasGps: false,
  });

  useEffect(() => {
    const checkContext = () => {
      const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
      const isStandaloneMode =
        hasMatchMedia &&
        (window.matchMedia("(display-mode: standalone)")?.matches ||
          ("standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone)));

      const isMobileWidth = typeof window !== "undefined" && window.innerWidth > 0 && window.innerWidth < 768;
      const isMobileDevice = isMobileWidth;
      const hasGpsCapability = typeof navigator !== "undefined" && "geolocation" in navigator;

      setState({
        isMounted: true,
        isStandalone: Boolean(isStandaloneMode),
        isMobile: isMobileDevice,
        isDesktop: !isMobileDevice,
        hasGps: hasGpsCapability,
      });
    };

    checkContext();

    const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
    const mediaQuery = hasMatchMedia ? window.matchMedia("(display-mode: standalone)") : null;
    const handleMediaChange = () => checkContext();
    const handleResize = () => checkContext();

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return state;
}
