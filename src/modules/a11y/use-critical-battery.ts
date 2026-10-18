"use client";

import { useEffect, useState } from "react";

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export function useCriticalBattery(threshold = 0.15) {
  const [isCritical, setIsCritical] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== "function") {
      return;
    }

    let batteryInstance: BatteryManager | null = null;

    const checkStatus = (battery: BatteryManager) => {
      const level = battery.level;
      const charging = battery.charging;
      setBatteryLevel(level);
      setIsCharging(charging);

      const critical = level <= threshold && !charging;
      setIsCritical(critical);

      if (critical) {
        document.documentElement.setAttribute("data-critical-battery", "true");
      } else {
        document.documentElement.removeAttribute("data-critical-battery");
      }
    };

    void nav.getBattery().then((battery) => {
      batteryInstance = battery;
      checkStatus(battery);

      const handleUpdate = () => checkStatus(battery);
      battery.addEventListener("levelchange", handleUpdate);
      battery.addEventListener("chargingchange", handleUpdate);
    }).catch(() => {
      // Ignorar defensivamente en navegadores sin soporte o permisos restringidos
    });

    return () => {
      if (batteryInstance) {
        // cleanup
      }
      document.documentElement.removeAttribute("data-critical-battery");
    };
  }, [threshold]);

  return {
    isCritical,
    batteryLevel,
    isCharging,
  };
}
