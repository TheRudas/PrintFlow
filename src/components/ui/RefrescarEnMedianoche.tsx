"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RefrescarEnMedianoche() {
  const router = useRouter();
  const fechaRef = useRef(new Date().toDateString());

  useEffect(() => {
    function verificarCambioDeDia(): void {
      const fechaActual = new Date().toDateString();
      if (fechaActual !== fechaRef.current) {
        fechaRef.current = fechaActual;
        router.refresh();
      }
    }

    const intervalo = setInterval(verificarCambioDeDia, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", verificarCambioDeDia);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", verificarCambioDeDia);
    };
  }, [router]);

  return null;
}
