"use client";

import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

/** True on mouse/trackpad devices. Hover-only effects (tilt, magnetic pull, cursor) gate on this. */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return fine;
}
