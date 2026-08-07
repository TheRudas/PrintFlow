"use client";

import { useCallback, useEffect, useState } from "react";
import { formatearMoneda } from "@/lib/formatear";

interface Props {
  nombreServicio: string;
  precioUnitario: number | null;
  cantidad: number;
  esCasa: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const DURACION_SALIDA_MS = 250;
const CURVA_ENTRADA = "cubic-bezier(0.16,1,0.3,1)";
const CURVA_SALIDA = "cubic-bezier(0.4,0,1,1)";

function formatearTotal(
  precioUnitario: number | null,
  cantidad: number,
  esCasa: boolean,
): string {
  if (esCasa || precioUnitario === null) {
    return "Sin costo";
  }
  return formatearMoneda(precioUnitario * cantidad);
}

export default function ConfirmarVenta({
  nombreServicio,
  precioUnitario,
  cantidad,
  esCasa,
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

  const total = formatearTotal(precioUnitario, cantidad, esCasa);

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
        className="relative flex w-full max-w-xs flex-col items-center gap-5 rounded-3xl border border-borde bg-superficie p-7 text-center shadow-2xl"
        style={{
          transition: `transform ${DURACION_SALIDA_MS}ms ${CURVA_SALIDA}, opacity ${DURACION_SALIDA_MS}ms ease-out`,
          transform: saliendo ? "scale(0.95)" : "scale(1)",
          opacity: saliendo ? 0 : 1,
          animation: saliendo ? "none" : `entrar-dialogo 0.3s ${CURVA_ENTRADA} both`,
        }}
      >
        <style>{`
          @keyframes entrar-dialogo {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">
          Pégale una revisada a los datos
        </p>

        <span className="text-xl font-bold text-texto">{nombreServicio}</span>

        <div className="flex w-full flex-col gap-2 rounded-2xl bg-superficie-alta px-4 py-3 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-texto-suave">Hojas sacadas:</span>
            <span className="font-semibold tabular-nums text-texto">{cantidad}</span>
          </div>
          {!esCasa && (
            <div className="flex justify-between text-sm">
              <span className="text-texto-suave">Costo por hoja:</span>
              <span className="font-semibold tabular-nums text-texto">
                {formatearMoneda(precioUnitario as number)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-borde pt-2 text-sm">
            <span className="font-semibold text-texto">Total</span>
            <span className="text-2xl font-extrabold tabular-nums text-texto">
              {total}
            </span>
          </div>
        </div>

        <div className="flex w-full gap-2 pt-1">
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
