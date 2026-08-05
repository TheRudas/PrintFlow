"use client";

import { useState } from "react";
import { nfcSoportado, urlDeSticker } from "@/lib/nfc/utilidades";

interface Props {
  slug: string;
}

type Estado = "inactivo" | "grabando" | "grabado" | "error";

export default function BotonGrabarSticker({ slug }: Props) {
  const [estado, setEstado] = useState<Estado>("inactivo");

  if (!nfcSoportado()) {
    return null;
  }

  async function grabar(): Promise<void> {
    setEstado("grabando");

    try {
      const escritor = new window.NDEFReader();
      await escritor.write({
        records: [
          {
            type: "url",
            data: urlDeSticker(slug),
          },
        ],
      });
      setEstado("grabado");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "grabado") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Sticker grabado
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={grabar}
        disabled={estado === "grabando"}
        className="rounded-full border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
      >
        {estado === "grabando" ? "Acercá el sticker..." : "Grabar sticker"}
      </button>
      {estado === "error" && (
        <span className="text-xs text-red-600">
          No se pudo grabar el sticker
        </span>
      )}
    </span>
  );
}
