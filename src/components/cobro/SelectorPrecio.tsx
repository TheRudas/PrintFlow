"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatearMoneda } from "@/lib/formatear";
import type { Servicio } from "@/lib/types";

interface Props {
  servicio: Servicio;
  precioSeleccionado: number | null;
  onSeleccionarPrecio: (precio: number) => void;
  onEscribirPrecio: (precio: number | null) => void;
}

const RETARDO_INICIAL_MS = 400;
const INTERVALO_MS = 80;

export default function SelectorPrecio({
  servicio,
  precioSeleccionado,
  onSeleccionarPrecio,
  onEscribirPrecio,
}: Props) {
  const precioRef = useRef(precioSeleccionado);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    precioRef.current = precioSeleccionado;
  }, [precioSeleccionado]);

  useEffect(() => {
    return () => {
      if (temporizadorRef.current !== null) clearTimeout(temporizadorRef.current);
      if (intervaloRef.current !== null) clearInterval(intervaloRef.current);
    };
  }, []);

  function detenerRepeticion(): void {
    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    if (intervaloRef.current !== null) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }

  const iniciarRepeticion = useCallback(
    (paso: number) => {
      detenerRepeticion();
      const aplicar = () => {
        const base = precioRef.current ?? 0;
        const siguiente = Math.max(0, Math.trunc(base) + paso);
        onEscribirPrecio(siguiente);
        precioRef.current = siguiente;
      };
      aplicar();
      temporizadorRef.current = setTimeout(() => {
        intervaloRef.current = setInterval(aplicar, INTERVALO_MS);
      }, RETARDO_INICIAL_MS);
    },
    [onEscribirPrecio]
  );

  const tienePresets = servicio.presets.length > 0;

  function esSeleccionado(precio: number): boolean {
    return precioSeleccionado !== null && precioSeleccionado === precio;
  }

  function manejarMontoLibre(valor: string): void {
    if (valor === "") {
      onEscribirPrecio(null);
      return;
    }
    const monto = Math.trunc(Number(valor));
    if (Number.isFinite(monto)) {
      onEscribirPrecio(monto);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {tienePresets && (
        <div className="flex flex-wrap gap-2">
          {servicio.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSeleccionarPrecio(preset)}
              className={`btn-feedback rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                esSeleccionado(preset)
                  ? "glow-marca border-marca-500 bg-marca-600 text-white"
                  : "sombra-suave border-borde bg-superficie text-texto hover:-translate-y-0.5 hover:border-marca-300"
              }`}
            >
              {formatearMoneda(preset)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="gradiente-marca bg-clip-text text-sm font-semibold uppercase tracking-wide text-transparent">
          Escribir valor personalizado
        </span>

        <div className="sombra-suave flex items-stretch rounded-2xl border border-borde bg-superficie overflow-hidden">
          <button
            type="button"
            onPointerDown={(evento) => {
              evento.preventDefault();
              if (precioSeleccionado !== null && precioSeleccionado > 0) {
                iniciarRepeticion(-50);
              }
            }}
            onPointerUp={detenerRepeticion}
            onPointerLeave={detenerRepeticion}
            onPointerCancel={detenerRepeticion}
            onContextMenu={(evento) => evento.preventDefault()}
            disabled={precioSeleccionado === null || precioSeleccionado <= 0}
            className="btn-feedback flex w-14 shrink-0 items-center justify-center border-r border-borde text-2xl font-bold text-texto hover:bg-marca-50 hover:text-marca-600 active:bg-marca-500 active:text-white disabled:opacity-30"
          >
            −
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Monto libre..."
            value={precioSeleccionado === null ? "" : precioSeleccionado}
            onChange={(evento) => manejarMontoLibre(evento.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-center text-lg text-texto placeholder:text-texto-tenue focus:outline-none"
          />

          <button
            type="button"
            onPointerDown={(evento) => {
              evento.preventDefault();
              iniciarRepeticion(50);
            }}
            onPointerUp={detenerRepeticion}
            onPointerLeave={detenerRepeticion}
            onPointerCancel={detenerRepeticion}
            onContextMenu={(evento) => evento.preventDefault()}
            className="btn-feedback flex w-14 shrink-0 items-center justify-center border-l border-borde text-2xl font-bold text-texto hover:bg-marca-50 hover:text-marca-600 active:bg-marca-500 active:text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
