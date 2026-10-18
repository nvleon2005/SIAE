"use client";

import { useEffect, useRef, useState } from "react";

interface HidInputReportEventLike {
  data: DataView;
}

interface HidDeviceLike {
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  addEventListener: (type: "inputreport", listener: (event: HidInputReportEventLike) => void) => void;
  removeEventListener: (type: "inputreport", listener: (event: HidInputReportEventLike) => void) => void;
}

interface HidLike {
  requestDevice: (options: { filters: Array<{ usagePage: number }> }) => Promise<HidDeviceLike[]>;
}

export type ExternalSwitchStatus = "unsupported" | "idle" | "connecting" | "connected" | "error";

function getHid(): HidLike | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { hid?: HidLike }).hid ?? null;
}

export function useExternalSwitch(onActivate: () => void) {
  const devicesRef = useRef<Array<{ device: HidDeviceLike; listener: (event: HidInputReportEventLike) => void }>>([]);
  const pressedRef = useRef(false);
  const [status, setStatus] = useState<ExternalSwitchStatus>("idle");
  const supported = Boolean(getHid());

  useEffect(() => () => {
    for (const { device, listener } of devicesRef.current) {
      device.removeEventListener("inputreport", listener);
      if (device.opened) void device.close();
    }
    devicesRef.current = [];
  }, []);

  const connect = async () => {
    const hid = getHid();
    if (!hid) {
      setStatus("unsupported");
      return;
    }

    setStatus("connecting");
    try {
      const devices = await hid.requestDevice({ filters: [{ usagePage: 0x09 }] });
      if (devices.length === 0) {
        setStatus("idle");
        return;
      }

      for (const device of devices) {
        if (!device.opened) await device.open();
        const listener = (event: HidInputReportEventLike) => {
          const isPressed = event.data.byteLength > 0 && event.data.getUint8(0) === 1;
          if (isPressed && !pressedRef.current) {
            pressedRef.current = true;
            onActivate();
          }
          if (!isPressed) pressedRef.current = false;
        };
        device.addEventListener("inputreport", listener);
        devicesRef.current.push({ device, listener });
      }
      setStatus("connected");
    } catch {
      setStatus("error");
    }
  };

  return { status, supported, connect };
}