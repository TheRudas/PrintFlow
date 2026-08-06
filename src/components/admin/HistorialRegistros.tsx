"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarRegistroComoAdmin } from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type { HistorialPaginado, Servicio } from "@/lib/types";
import DialogoConfirmacion from "@/components/ui/DialogoConfirmacion";

interface Props {
  historialInicial: HistorialPaginado;
  servicios: Servicio[];
}

function nombreDeServicio(
  servicioId: string,
  servicios: Servicio[]
): string {
  const servicio = servicios.find((item) => item.id === servicioId);
  return servicio?.nombre ?? "Servicio eliminado";
}

function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialRegistros({
  historialInicial,
  servicios,
}: Props) {
  const [historial, setHistorial] = useState(historialInicial);
  const [registroAEliminar, setRegistroAEliminar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const router = useRouter();

  const historialAnterior = useRef(historialInicial);

  useEffect(() => {
    if (historialAnterior.current !== historialInicial) {
      historialAnterior.current = historialInicial;
      setHistorial(historialInicial);
    }
  }, [historialInicial]);

  async function eliminarRegistro(): Promise<void> {
    if (!registroAEliminar) {
      return;
    }

    const resultado = await eliminarRegistroComoAdmin(registroAEliminar.id);
    setRegistroAEliminar(null);

    if (resultado.exito) {
      router.refresh();
    } else {
      window.alert(resultado.error ?? "No se pudo eliminar el registro");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">Historial</h2>
        <span className="text-xs text-texto-tenue">
          {historial.totalRegistros} en total
        </span>
      </div>

      {historial.registros.length === 0 ? (
        <p className="text-sm text-texto-suave">Aún no hay registros.</p>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
          {historial.registros.map((registro) => (
            <div
              key={registro.id}
              className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-texto">
                  {nombreDeServicio(registro.servicio_id, servicios)}
                </p>
                <p className="text-xs text-texto-suave">
                  {formatearFecha(registro.creado_en)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-texto">
                    {formatearMoneda(registro.total)}
                  </p>
                  <p className="text-xs text-texto-suave">
                    {registro.cantidad} ×{" "}
                    {formatearMoneda(registro.precio_unitario)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRegistroAEliminar({
                      id: registro.id,
                      nombre: nombreDeServicio(
                        registro.servicio_id,
                        servicios
                      ),
                    })
                  }
                  aria-label={`Eliminar registro de ${nombreDeServicio(
                    registro.servicio_id,
                    servicios
                  )}`}
                  title="Eliminar registro"
                  className="btn-feedback glow-rojo flex h-6 shrink-0 items-center justify-center rounded-full border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  −
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {registroAEliminar && (
        <DialogoConfirmacion
          titulo="Eliminar registro"
          mensaje={`¿Estás seguro de que quieres eliminar el registro de ${registroAEliminar.nombre}?`}
          textoConfirmar="Eliminar"
          onConfirmar={eliminarRegistro}
          onCancelar={() => setRegistroAEliminar(null)}
        />
      )}
    </div>
  );
}
