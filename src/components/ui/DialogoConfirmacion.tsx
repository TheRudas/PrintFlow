"use client";

import { useCallback, useEffect, useState } from "react";

interface Props {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const DURACION_SALIDA_MS = 200;

export default function DialogoConfirmacion({
  titulo,
  mensaje,
  textoConfirmar,
  onConfirmar,
  onCancelar,
}: Props) {
  const [saliendo, setSaliendo] = useState(false);

  function confirmar(): void {
    setSaliendo(true);
    setTimeout(onConfirmar, DURACION_SALIDA_MS);
  }

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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 ${
        saliendo ? "pointer-events-none" : ""
      }`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
          saliendo ? "opacity-0" : "opacity-100"
        }`}
        onClick={cancelar}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex w-full max-w-xs flex-col items-center gap-5 rounded-3xl border border-borde bg-superficie p-7 text-center shadow-2xl transition-all duration-200 ease-out ${
          saliendo
            ? "scale-90 opacity-0"
            : "animate-[toast-entrar_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-2xl font-bold text-white">
          !
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-texto">{titulo}</h3>
          <p className="text-sm text-texto-suave">{mensaje}</p>
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={cancelar}
            className="btn-feedback flex-1 rounded-full border border-borde bg-superficie py-3 text-sm font-medium text-texto hover:bg-superficie-alta"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="btn-feedback glow-rojo flex-1 rounded-full bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
