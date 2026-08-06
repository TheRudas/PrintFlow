"use client";

import { useState } from "react";
import { obtenerHistorialCompletoComoAdmin } from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type {
  HistorialPaginado,
  ModalidadHistorial,
  Servicio,
  TipoHistorial,
} from "@/lib/types";

interface Props {
  historialInicial: HistorialPaginado;
  servicios: Servicio[];
}

const TIPOS: Array<{ valor: TipoHistorial; etiqueta: string }> = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "impresion", etiqueta: "Impresión" },
  { valor: "fotocopia", etiqueta: "Fotocopias" },
];

const MODALIDADES: Array<{ valor: ModalidadHistorial; etiqueta: string }> = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "bn", etiqueta: "B/N" },
  { valor: "color", etiqueta: "A Color" },
];

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

export default function HistorialCompleto({
  historialInicial,
  servicios,
}: Props) {
  const [historial, setHistorial] = useState(historialInicial);
  const [tipo, setTipo] = useState<TipoHistorial>("todas");
  const [modalidad, setModalidad] = useState<ModalidadHistorial>("todas");
  const [cargando, setCargando] = useState(false);

  const mostrarSubfiltro = tipo !== "todas";
  const totalPaginas = Math.max(
    1,
    Math.ceil(historial.totalRegistros / historial.tamanoPagina)
  );
  const paginaActual = historial.pagina;

  async function cargarPagina(
    pagina: number,
    tipoElegido: TipoHistorial,
    modalidadElegida: ModalidadHistorial
  ): Promise<void> {
    setCargando(true);
    const resultado = await obtenerHistorialCompletoComoAdmin(pagina, {
      tipo: tipoElegido,
      modalidad: modalidadElegida,
    });
    setHistorial(resultado);
    setCargando(false);
  }

  function cambiarTipo(nuevoTipo: TipoHistorial): void {
    setTipo(nuevoTipo);
    setModalidad("todas");
    cargarPagina(0, nuevoTipo, "todas");
  }

  function cambiarModalidad(nuevaModalidad: ModalidadHistorial): void {
    setModalidad(nuevaModalidad);
    cargarPagina(0, tipo, nuevaModalidad);
  }

  async function irAPagina(pagina: number): Promise<void> {
    if (pagina < 0 || pagina >= totalPaginas || cargando) {
      return;
    }
    cargarPagina(pagina, tipo, modalidad);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => cambiarTipo(opcion.valor)}
              className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                tipo === opcion.valor
                  ? "glow-marca border-marca-500 bg-marca-500 text-white"
                  : "border-borde bg-superficie text-texto hover:border-marca-300"
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        {mostrarSubfiltro && (
          <div className="flex flex-wrap gap-2">
            {MODALIDADES.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => cambiarModalidad(opcion.valor)}
                className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                  modalidad === opcion.valor
                    ? "glow-marca border-marca-500 bg-marca-500 text-white"
                    : "border-borde bg-superficie text-texto hover:border-marca-300"
                }`}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">
          Historial completo
        </h2>
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
