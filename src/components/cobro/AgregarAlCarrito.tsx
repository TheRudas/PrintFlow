"use client";

import { useState } from "react";
import type { Servicio } from "@/lib/types";
import SelectorPrecio from "./SelectorPrecio";
import ContadorCantidad from "./ContadorCantidad";

interface Props {
  servicios: Servicio[];
  onAgregar: (servicio: Servicio, precio: number, cantidad: number) => void;
  onCancelar: () => void;
}

export default function AgregarAlCarrito({
  servicios,
  onAgregar,
  onCancelar,
}: Props) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);

  function seleccionarServicio(nuevo: Servicio): void {
    setServicio(nuevo);
    setPrecioUnitario(nuevo.precio_por_defecto);
    setCantidad(1);
  }

  function agregar(): void {
    if (!servicio || !precioUnitario || precioUnitario <= 0) {
      return;
    }
    onAgregar(servicio, precioUnitario, cantidad);
  }

  const puedeAgregar = servicio !== null && precioUnitario !== null && precioUnitario > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
        onClick={onCancelar}
      />
      <div className="relative flex w-full max-w-xs flex-col gap-4 rounded-3xl border border-borde bg-superficie p-5 shadow-2xl animate-[toast-entrar_0.2s_cubic-bezier(0.16,1,0.3,1)]">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-texto-suave">
          Agregar al paquete
        </p>

        <div className="flex flex-wrap gap-2">
          {servicios.map((s) => {
            const seleccionado = s.id === servicio?.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => seleccionarServicio(s)}
                className={`btn-feedback rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                  seleccionado
                    ? "border-marca-500 bg-marca-500 text-white"
                    : "border-borde bg-superficie text-texto hover:border-marca-300"
                }`}
              >
                {s.nombre}
              </button>
            );
          })}
        </div>

        {servicio && (
          <SelectorPrecio
            servicio={servicio}
            precioSeleccionado={precioUnitario}
            onSeleccionarPrecio={setPrecioUnitario}
            onEscribirPrecio={setPrecioUnitario}
          />
        )}

        <ContadorCantidad
          cantidad={cantidad}
          onCambiarCantidad={(n) => {
            if (n >= 1) setCantidad(n);
          }}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="btn-feedback flex-1 rounded-full border border-borde bg-superficie py-2.5 text-sm font-medium text-texto hover:bg-superficie-alta"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={agregar}
            disabled={!puedeAgregar}
            className="btn-feedback glow-marca gradiente-marca flex-1 rounded-full py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
