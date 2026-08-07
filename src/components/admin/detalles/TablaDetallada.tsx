"use client";

import { useState } from "react";
import { formatearMoneda } from "@/lib/formatear";
import type { Registro, Servicio } from "@/lib/types";
import {
  eliminarRegistrosComoAdmin,
} from "@/lib/admin/acciones";
import DialogoConfirmacion from "@/components/ui/DialogoConfirmacion";

interface Props {
  registros: Registro[];
  servicios: Servicio[];
}

function nombreDeServicio(id: string, servicios: Servicio[]): string {
  return servicios.find((s) => s.id === id)?.nombre ?? "Servicio eliminado";
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TablaDetallada({ registros, servicios }: Props) {
  const [confirmando, setConfirmando] = useState<string | null>(null);

  async function eliminar(id: string): Promise<void> {
    setConfirmando(null);
    const resultado = await eliminarRegistrosComoAdmin([id]);
    if (!resultado.exito) {
      window.alert(resultado.error ?? "No se pudo eliminar");
    }
  }

  if (registros.length === 0) {
    return (
      <p className="text-sm text-texto-suave">No hay registros en este período.</p>
    );
  }

  return (
    <div className="sombra-suave flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
      <div className="max-h-96 overflow-y-auto">
        {registros.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-texto">
                {nombreDeServicio(r.servicio_id, servicios)}
                {r.es_casa && (
                  <span className="ml-2 rounded-full bg-marca-100 px-2 py-0.5 text-xs font-semibold text-marca-700 dark:bg-marca-100 dark:text-marca-300">
                    Casa
                  </span>
                )}
              </p>
              <p className="text-xs text-texto-suave">
                {formatearFecha(r.creado_en)} · {r.cantidad} × {formatearMoneda(r.precio_unitario)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tabular-nums text-texto">
                {formatearMoneda(r.total)}
              </span>
              <button
                type="button"
                onClick={() => setConfirmando(r.id)}
                className="btn-feedback flex h-6 w-6 items-center justify-center rounded-full text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                aria-label="Eliminar registro"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmando && (
        <DialogoConfirmacion
          titulo="Eliminar registro"
          mensaje="¿Quieres eliminar este registro? Esta acción no se puede deshacer."
          textoConfirmar="Eliminar"
          onConfirmar={() => eliminar(confirmando)}
          onCancelar={() => setConfirmando(null)}
        />
      )}
    </div>
  );
}
