"use client";

import { useEffect } from "react";

export type TipoToast = "exito" | "error";

interface Props {
  mensaje: string;
  tipo: TipoToast;
  onCerrar: () => void;
  duracionMs?: number;
}

export default function Toast({
  mensaje,
  tipo,
  onCerrar,
  duracionMs = 3000,
}: Props) {
  useEffect(() => {
    const temporizador = setTimeout(onCerrar, duracionMs);
    return () => clearTimeout(temporizador);
  }, [onCerrar, duracionMs]);

  const esExito = tipo === "exito";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex animate-[toast-in_0.2s_ease] items-center gap-3 rounded-full border px-5 py-3 shadow-lg ${
          esExito
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
            esExito ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {esExito ? "✓" : "!"}
        </span>
        <span className="text-sm font-medium">{mensaje}</span>
      </div>
    </div>
  );
}
