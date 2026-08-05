"use client";

import { useState } from "react";
import { obtenerPaginaHistorial } from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type { HistorialPaginado, Servicio } from "@/lib/types";

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

export default function HistorialRegistros({
  historialInicial,
  servicios,
}: Props) {
  const [historial, setHistorial] = useState(historialInicial);
  const [cargando, setCargando] = useState(false);

  const totalPaginas = Math.max(
    1,
    Math.ceil(historial.totalRegistros / historial.tamanoPagina)
  );
  const paginaActual = historial.pagina;

  async function irAPagina(pagina: number): Promise<void> {
    if (pagina < 0 || pagina >= totalPaginas || cargando) {
      return;
    }

    setCargando(true);
    const resultado = await obtenerPaginaHistorial(pagina);
    setHistorial(resultado);
    setCargando(false);
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
                  {new Date(registro.creado_en).toLocaleString("es-AR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-texto">
                  {formatearMoneda(registro.total)}
                </p>
                <p className="text-xs text-texto-suave">
                  {registro.cantidad} ×{" "}
                  {formatearMoneda(registro.precio_unitario)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => irAPagina(paginaActual - 1)}
            disabled={paginaActual === 0 || cargando}
            className="btn-feedback rounded-full border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 disabled:opacity-40 dark:text-marca-300"
          >
            Anterior
          </button>
          <span className="text-sm text-texto-suave">
            {paginaActual + 1} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => irAPagina(paginaActual + 1)}
            disabled={paginaActual + 1 >= totalPaginas || cargando}
            className="btn-feedback rounded-full border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 disabled:opacity-40 dark:text-marca-300"
          >
            Siguiente
          </button>
        </div>
      )}
      {cargando && (
        <p className="text-center text-xs text-texto-tenue">Cargando...</p>
      )}
    </div>
  );
}
