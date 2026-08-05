"use client";

import { useEffect, useState } from "react";
import { urlDeSticker } from "@/lib/nfc/utilidades";
import type { Servicio } from "@/lib/types";

interface Props {
  servicios: Servicio[];
}

const PASOS = [
  "Instalá la app NFC Tools desde Play Store.",
  "Abrí NFC Tools y tocá «Write» (Escribir).",
  "Tocá «Add a record» (Agregar registro) y elegí «URI».",
  "Pegá el enlace del servicio que querés grabar.",
  "Tocá «Write» (Escribir) y apoyá el sticker en la parte trasera del celular.",
  "Cuando diga «Write successful», el sticker quedó programado.",
];

export default function InstructivoStickers({ servicios }: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    if (!copiado) {
      return;
    }
    const temporizador = setTimeout(() => setCopiado(null), 2000);
    return () => clearTimeout(temporizador);
  }, [copiado]);

  async function copiarEnlace(slug: string): Promise<void> {
    await navigator.clipboard.writeText(urlDeSticker(slug));
    setCopiado(slug);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <div>
        <h2 className="font-semibold text-zinc-900">Stickers NFC</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Para grabar muchos stickers de una vez, usá la app NFC Tools:
        </p>
      </div>

      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-zinc-700">
        {PASOS.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-600">
          Enlaces de cada servicio:
        </p>
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {servicio.nombre}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {servicio.activo
                  ? urlDeSticker(servicio.slug)
                  : "Servicio inactivo"}
              </p>
            </div>
            {servicio.activo && (
              <button
                type="button"
                onClick={() => copiarEnlace(servicio.slug)}
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {copiado === servicio.slug ? "Copiado" : "Copiar"}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        El enlace siempre apunta al dominio actual de la app. Si algún día
        cambiás el dominio, hay que volver a grabar los stickers.
      </p>
    </div>
  );
}
