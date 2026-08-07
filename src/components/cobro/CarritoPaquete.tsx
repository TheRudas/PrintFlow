"use client";

import { useMemo } from "react";
import { formatearMoneda } from "@/lib/formatear";
import type { ItemCarrito, Servicio } from "@/lib/types";

interface Props {
  items: ItemCarrito[];
  servicios: Servicio[];
  guardando: boolean;
  onAgregar: () => void;
  onEliminar: (id: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function CarritoPaquete({
  items,
  guardando,
  onAgregar,
  onEliminar,
  onGuardar,
  onCancelar,
}: Props) {
  const total = useMemo(
    () => items.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0),
    [items]
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-marca-500">
          <span className="gradiente-marca h-4 w-1 rounded-full" />
          Paquete ({items.length})
        </h2>
        <button
          type="button"
          onClick={onCancelar}
          className="text-xs font-medium text-texto-suave hover:text-texto"
        >
          Volver
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-texto-suave">
          Agrega servicios al paquete para armar una venta combinada.
        </p>
      ) : (
        <div className="sombra-suave flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 border-b border-borde px-4 py-3 ${
                i === items.length - 1 ? "border-b-0" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-texto">
                  {item.nombre}
                </p>
                <p className="text-xs text-texto-suave">
                  {formatearMoneda(item.precioUnitario)} × {item.cantidad}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-texto">
                  {formatearMoneda(item.precioUnitario * item.cantidad)}
                </span>
                <button
                  type="button"
                  onClick={() => onEliminar(item.id)}
                  className="btn-feedback flex h-6 w-6 items-center justify-center rounded-full text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  aria-label={`Eliminar ${item.nombre}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAgregar}
        className="btn-feedback rounded-full border-2 border-dashed border-borde bg-superficie py-3 text-sm font-medium text-texto-suave hover:border-marca-300 hover:text-texto"
      >
        + Agregar servicio
      </button>

      {items.length > 0 && (
        <div className="sombra-marca flex flex-col gap-4 rounded-3xl bg-marca-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white/90">Total</span>
            <span className="text-2xl font-extrabold tabular-nums">
              {formatearMoneda(total)}
            </span>
          </div>
          <button
            type="button"
            onClick={onGuardar}
            disabled={guardando}
            className="btn-feedback glow-rosa gradiente-marca rounded-full py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? "Guardando..." : "Guardar paquete"}
          </button>
        </div>
      )}
    </div>
  );
}
