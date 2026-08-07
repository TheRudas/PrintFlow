"use client";

import { useState } from "react";
import {
  eliminarRegistrosComoAdmin,
  obtenerHistorialCompletoComoAdmin,
} from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type {
  HistorialPaginado,
  ModalidadHistorial,
  Servicio,
  TipoHistorial,
} from "@/lib/types";
import DialogoConfirmacion from "@/components/ui/DialogoConfirmacion";

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

function fechaBogotaAIso(fecha: string): string {
  return `${fecha}T05:00:00.000Z`;
}

function diaSiguiente(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
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

export default function HistorialCompleto({
  historialInicial,
  servicios,
}: Props) {
  const [historial, setHistorial] = useState(historialInicial);
  const [tipo, setTipo] = useState<TipoHistorial>("todas");
  const [modalidad, setModalidad] = useState<ModalidadHistorial>("todas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const mostrarSubfiltro = tipo !== "todas";
  const cantidadSeleccionados = seleccionados.size;

  async function cargarHistorial(
    tipoElegido: TipoHistorial,
    modalidadElegida: ModalidadHistorial,
    desde?: string,
    hasta?: string,
  ): Promise<void> {
    setCargando(true);
    setHistorial({
      registros: [],
      totalRegistros: 0,
      pagina: 0,
      tamanoPagina: 200,
    });
    setSeleccionados(new Set());
    const resultado = await obtenerHistorialCompletoComoAdmin(0, {
      tipo: tipoElegido,
      modalidad: modalidadElegida,
      fechaDesde: desde || undefined,
      fechaHasta: hasta || undefined,
    });
    setHistorial(resultado);
    setCargando(false);
  }

  function cambiarTipo(nuevoTipo: TipoHistorial): void {
    setTipo(nuevoTipo);
    setModalidad("todas");
    cargarHistorial(nuevoTipo, "todas", fechasActivas().desde, fechasActivas().hasta);
  }

  function cambiarModalidad(nuevaModalidad: ModalidadHistorial): void {
    setModalidad(nuevaModalidad);
    cargarHistorial(tipo, nuevaModalidad, fechasActivas().desde, fechasActivas().hasta);
  }

  function fechasActivas(): { desde: string | undefined; hasta: string | undefined } {
    return {
      desde: fechaDesde ? fechaBogotaAIso(fechaDesde) : undefined,
      hasta: fechaHasta ? fechaBogotaAIso(diaSiguiente(fechaHasta)) : undefined,
    };
  }

  function aplicarFiltroFechas(): void {
    const { desde, hasta } = fechasActivas();
    cargarHistorial(tipo, modalidad, desde, hasta);
  }

  function limpiarFechas(): void {
    setFechaDesde("");
    setFechaHasta("");
    cargarHistorial(tipo, modalidad);
  }

  function alternarSeleccion(id: string): void {
    setSeleccionados((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  }

  function alternarSeleccionDePagina(): void {
    const idsPagina = historial.registros.map((registro) => registro.id);
    const todosSeleccionados = idsPagina.every((id) =>
      seleccionados.has(id)
    );

    setSeleccionados((actual) => {
      const nuevo = new Set(actual);
      if (todosSeleccionados) {
        idsPagina.forEach((id) => nuevo.delete(id));
      } else {
        idsPagina.forEach((id) => nuevo.add(id));
      }
      return nuevo;
    });
  }

  async function eliminarSeleccionados(): Promise<void> {
    setConfirmarEliminar(false);
    const ids = Array.from(seleccionados);

    const resultado = await eliminarRegistrosComoAdmin(ids);
    setSeleccionados(new Set());

    if (!resultado.exito) {
      window.alert(resultado.error ?? "No se pudo eliminar");
      return;
    }

    await cargarHistorial(tipo, modalidad, fechasActivas().desde, fechasActivas().hasta);
  }

  const todosSeleccionadosEnPagina =
    historial.registros.length > 0 &&
    historial.registros.every((registro) => seleccionados.has(registro.id));

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-texto-suave">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto focus:border-marca-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-texto-suave">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto focus:border-marca-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={aplicarFiltroFechas}
            disabled={!fechaDesde && !fechaHasta}
            className="btn-feedback rounded-xl border border-marca-200 bg-superficie px-3 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 disabled:opacity-40 dark:text-marca-300"
          >
            Filtrar
          </button>
          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              onClick={limpiarFechas}
              className="btn-feedback rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto-suave hover:bg-superficie-alta"
            >
              Limpiar
            </button>
          )}
        </div>

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
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-marca-500">
          <span className="gradiente-marca h-4 w-1 rounded-full" />
          Historial completo
        </h2>
        <span className="text-xs text-texto-tenue">
          {historial.totalRegistros} en total
        </span>
      </div>

      {cargando ? (
        <div className="sombra-suave flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
          <div className="border-b border-borde bg-superficie-alta px-4 py-2">
            <div className="h-4 w-32 animate-pulse rounded bg-superficie-alta" />
          </div>
          {[0, 1, 2, 3, 4].map((indice) => (
            <div
              key={indice}
              className="flex items-center justify-between border-b border-borde px-4 py-3 last:border-b-0"
            >
              <div className="flex flex-col gap-2">
                <div className="h-3 w-40 animate-pulse rounded bg-superficie-alta" />
                <div className="h-3 w-24 animate-pulse rounded bg-superficie-alta" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-3 w-16 animate-pulse rounded bg-superficie-alta" />
                <div className="h-3 w-10 animate-pulse rounded bg-superficie-alta" />
              </div>
            </div>
          ))}
        </div>
      ) : historial.registros.length === 0 ? (
        <p className="text-sm text-texto-suave">Aún no hay registros.</p>
      ) : (
        <div className="sombra-suave flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
          <div className="flex items-center justify-between border-b border-borde bg-superficie-alta px-4 py-2">
            <label className="flex items-center gap-2 text-sm text-texto-suave">
              <input
                type="checkbox"
                checked={todosSeleccionadosEnPagina}
                onChange={alternarSeleccionDePagina}
                className="h-4 w-4 accent-marca-500"
              />
              Seleccionar todo
            </label>
            {cantidadSeleccionados > 0 && (
              <span className="text-xs text-texto-tenue">
                {cantidadSeleccionados} seleccionados
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {historial.registros.map((registro) => {
              const seleccionado = seleccionados.has(registro.id);
              return (
                <div
                  key={registro.id}
                  className={`flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0 ${
                    seleccionado ? "bg-marca-50 dark:bg-marca-100" : ""
                  }`}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={seleccionado}
                      onChange={() => alternarSeleccion(registro.id)}
                      className="h-4 w-4 shrink-0 accent-marca-500"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-texto">
                        {nombreDeServicio(registro.servicio_id, servicios)}
                        {registro.es_casa && (
                          <span className="ml-2 rounded-full bg-marca-100 px-2 py-0.5 text-xs font-semibold text-marca-700 dark:bg-marca-100 dark:text-marca-300">
                            Casa
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-texto-suave">
                        {formatearFecha(registro.creado_en)}
                      </span>
                    </span>
                  </label>
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
              );
            })}
          </div>
        </div>
      )}

      {cantidadSeleccionados > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3">
          <span className="text-sm font-medium text-texto">
            {cantidadSeleccionados}{" "}
            {cantidadSeleccionados === 1 ? "registro" : "registros"}{" "}
            seleccionado{cantidadSeleccionados === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setConfirmarEliminar(true)}
            className="btn-feedback glow-rojo rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Eliminar seleccionados
          </button>
        </div>
      )}

      {confirmarEliminar && (
        <DialogoConfirmacion
          titulo="Eliminar seleccionados"
          mensaje={`¿Estás seguro de que quieres eliminar ${cantidadSeleccionados} ${
            cantidadSeleccionados === 1 ? "registro" : "registros"
          }?`}
          textoConfirmar="Eliminar"
          onConfirmar={eliminarSeleccionados}
          onCancelar={() => setConfirmarEliminar(false)}
        />
      )}
    </div>
  );
}
