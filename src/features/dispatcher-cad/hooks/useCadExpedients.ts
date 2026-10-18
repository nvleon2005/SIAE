import { useState, useEffect } from "react";

export function useCadExpedients() {
  const [closeModal, setCloseModal] = useState<{
    open: boolean;
    demandId: string | null;
  }>({ open: false, demandId: null });
  const [hlvTime, setHlvTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      setHlvTime(
        new Date().toLocaleTimeString("es-VE", {
          timeZone: "America/Caracas",
          hour12: false,
        }),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return { closeModal, setCloseModal, hlvTime };
}
