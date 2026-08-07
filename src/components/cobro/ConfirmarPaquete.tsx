"use client";

import { useCallback, useEffect, useState } from "react";
import { formatearMoneda } from "@/lib/formatear";
import type { ItemCarrito } from "@/lib/types";

interface Props {
  items: ItemCarrito[];
  onConfirmar: () => void;
  onCancelar: () => void;
}

const DURACION_SALIDA_MS = 200;

export default function ConfirmarPaquete({
  items,
  onConfirmar,
  onCancelar,
}: Props) {
  const [saliendo, setSaliendo] = useState(false);

  const confirmar = useCallback((): void => {
    setSaliendo(true);
    setTimeout(onConfirmar, DURACION_SALIDA_MS);
  }, [onConfirmar]);

  const cancelar = useCallback((): void => {
    setSaliendo(true);
    setTimeout(onCancelar, DURACION_SALIDA_MS);
  }, [onCancelar]);

  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent): void {
      if (evento.key === "Escape") {
        cancelar();
      }
    }
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [cancelar]);

  const total = items.reduce(
    (suma, i) => suma + i.precioUnitario * i.cantidad,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 ${
        saliendo ? "pointer-events-none" : ""
      }`}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out"
        style={{ opacity: saliendo ? 0 : 1 }}
        onClick={cancelar}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-xs flex-col items-stretch gap-4 rounded-3xl border border-borde bg-superficie p-7 shadow-2xl"
        style={{
          transition: `transform ${DURACION_SALIDA_MS}ms cubic-bezier(0.4,0,1,1), opacity ${DURACION_SALIDA_MS}ms ease-out`,
          transform: saliendo ? "scale(0.95)" : "scale(1)",
          opacity: saliendo ? 0 : 1,
          animation: saliendo
            ? "none"
            : `entrar-dialogo 0.3s cubic-bezier(0.16,1,0.3,1) both`,
        }}
      >
        <style>{`
          @keyframes entrar-dialogo {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <p className="text-center text-xs font-medium uppercase tracking-wide text-texto-suave">
          Pégale una revisada a los datos
        </p>

        <span className="text-center text-lg font-bold text-texto">
          Paquete ({items.length})
        </span>

        <div className="flex flex-col gap-1 rounded-2xl bg-superficie-alta p-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between py-1 text-sm ${
                i < items.length - 1
                  ? "border-b border-borde pb-2"
                  : ""
              }`}
            >
              <span className="text-texto">
                {item.nombre}{" "}
                <span className="text-texto-suave">
                  {formatearMoneda(item.precioUnitario)} × {item.cantidad}
                </span>
              </span>
              <span className="font-semibold tabular-nums text-texto">
                {formatearMoneda(item.precioUnitario * item.cantidad)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-borde pt-2 text-sm">
            <span className="font-semibold text-texto">Total</span>
            <span className="text-2xl font-extrabold tabular-nums text-texto">
              {formatearMoneda(total)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={cancelar}
            disabled={saliendo}
            className="btn-feedback glow-rojo flex-1 rounded-full bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={saliendo}
            className="btn-feedback glow-rosa gradiente-marca flex-1 rounded-full py-3 text-sm font-bold text-white"
          >
            Sí, guardar
          </button>
        </div>
      </div>
    </div>
  );
}
