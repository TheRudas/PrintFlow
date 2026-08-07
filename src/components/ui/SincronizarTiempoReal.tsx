"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

export default function SincronizarTiempoReal() {
  const router = useRouter();
  const refrescoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canalRef = useRef<{ unsubscribe: () => void } | null>(null);
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    let cancelado = false;

    async function suscribir(): Promise<void> {
      const supabase = crearClienteSupabase();

      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelado) {
        return;
      }

      function programarRefresco(): void {
        if (refrescoRef.current) {
          clearTimeout(refrescoRef.current);
        }
        refrescoRef.current = setTimeout(() => {
          if (!cancelado) {
            routerRef.current.refresh();
          }
          refrescoRef.current = null;
        }, 150);
      }

      canalRef.current = supabase
        .channel("registros-cambios")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "registros" },
          () => programarRefresco()
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "registros" },
          () => programarRefresco()
        )
        .subscribe();
    }

    suscribir();

    return () => {
      cancelado = true;
      if (canalRef.current) {
        canalRef.current.unsubscribe();
        canalRef.current = null;
      }
      if (refrescoRef.current) {
        clearTimeout(refrescoRef.current);
      }
    };
  }, []);

  return null;
}
