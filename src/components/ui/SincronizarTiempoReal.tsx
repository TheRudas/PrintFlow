"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

interface Props {
  perfilId: string | null;
}

export default function SincronizarTiempoReal({ perfilId }: Props) {
  const router = useRouter();
  const refrescoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canalRef = useRef<{ unsubscribe: () => void } | null>(null);
  const routerRef = useRef(router);
  const perfilIdRef = useRef(perfilId);

  useEffect(() => {
    routerRef.current = router;
    perfilIdRef.current = perfilId;
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
          (payload) => {
            const perfilActual = perfilIdRef.current;
            if (perfilActual && payload.new.perfil_id === perfilActual) {
              return;
            }
            programarRefresco();
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "registros" },
          () => {
            programarRefresco();
          }
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
