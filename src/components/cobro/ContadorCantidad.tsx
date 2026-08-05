"use client";

import { useCallback, useEffect, useRef } from "react";

interface Props {
  cantidad: number;
  onCambiarCantidad: (cantidad: number) => void;
}

const RETARDO_INICIAL_MS = 400;
const INTERVALO_MS = 80;

export default function ContadorCantidad({
  cantidad,
  onCambiarCantidad,
}: Props) {
  const cantidadRef = useRef(cantidad);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    cantidadRef.current = cantidad;
  }, [cantidad]);

  useEffect(() => {
    return () => {
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
      }
      if (intervaloRef.current !== null) {
        clearInterval(intervaloRef.current);
      }
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
        const siguiente = cantidadRef.current + paso;
        if (siguiente >= 1) {
          onCambiarCantidad(siguiente);
          cantidadRef.current = siguiente;
        }
      };

      aplicar();

      temporizadorRef.current = setTimeout(() => {
        intervaloRef.current = setInterval(aplicar, INTERVALO_MS);
      }, RETARDO_INICIAL_MS);
    },
    [onCambiarCantidad]
  );

  return (
    <div className="flex items-center justify-between rounded-2xl border-2 border-borde bg-superficie p-2">
      <button
        type="button"
        onPointerDown={(evento) => {
          evento.preventDefault();
          if (cantidad > 1) {
            iniciarRepeticion(-1);
          }
        }}
        onPointerUp={detenerRepeticion}
        onPointerLeave={detenerRepeticion}
        onPointerCancel={detenerRepeticion}
        onContextMenu={(evento) => evento.preventDefault()}
        disabled={cantidad <= 1}
        className="btn-feedback flex h-14 w-14 items-center justify-center rounded-xl bg-marca-100 text-2xl font-bold text-marca-700 hover:bg-marca-200 disabled:opacity-40 dark:text-marca-300"
      >
        −
      </button>
      <div className="text-center">
        <div className="text-3xl font-bold text-texto">{cantidad}</div>
        <div className="text-xs text-texto-suave">hojas</div>
      </div>
      <button
        type="button"
        onPointerDown={(evento) => {
          evento.preventDefault();
          iniciarRepeticion(1);
        }}
        onPointerUp={detenerRepeticion}
        onPointerLeave={detenerRepeticion}
        onPointerCancel={detenerRepeticion}
        onContextMenu={(evento) => evento.preventDefault()}
        className="btn-feedback flex h-14 w-14 items-center justify-center rounded-xl bg-marca-100 text-2xl font-bold text-marca-700 hover:bg-marca-200 dark:text-marca-300"
      >
        +
      </button>
    </div>
  );
}
