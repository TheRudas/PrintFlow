"use client";

import { useEffect, useState } from "react";

export type TipoToast = "exito" | "error";

interface Props {
  mensaje: string;
  tipo: TipoToast;
  onCerrar: () => void;
  duracionMs?: number;
}

const DURACION_SALIDA_MS = 250;

export default function Toast({
  mensaje,
  tipo,
  onCerrar,
  duracionMs = 2000,
}: Props) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setSaliendo(true), duracionMs);
    return () => clearTimeout(temporizador);
  }, [duracionMs]);

  useEffect(() => {
    if (!saliendo) {
      return;
    }
    const temporizador = setTimeout(onCerrar, DURACION_SALIDA_MS);
    return () => clearTimeout(temporizador);
  }, [saliendo, onCerrar]);

  const esExito = tipo === "exito";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 ${
        saliendo ? "pointer-events-none" : ""
      }`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          saliendo ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        role="status"
        className={`relative flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border bg-superficie p-8 text-center shadow-2xl transition-all duration-300 ease-out ${
          saliendo
            ? "scale-90 opacity-0"
            : "animate-[toast-entrar_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        } ${esExito ? "border-emerald-200" : "border-red-200"}`}
      >
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white ${
            esExito ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {esExito ? "✓" : "!"}
        </span>
        <span
          className={`text-base font-medium ${
            esExito
              ? "text-emerald-900 dark:text-emerald-200"
              : "text-red-900 dark:text-red-200"
          }`}
        >
          {mensaje}
        </span>
      </div>
    </div>
  );
}
