"use client";

import { useRef, useState } from "react";
import {
  extraerSlugDeRecords,
  nfcSoportado,
} from "@/lib/nfc/utilidades";
import type { LecturaNfc } from "@/lib/nfc/tipos";

interface Props {
  onSlugLeido: (slug: string) => void;
}

type Estado = "inactivo" | "leyendo" | "error";

export default function BotonEscanear({ onSlugLeido }: Props) {
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const lectorRef = useRef<LecturaNfc | null>(null);

  if (!nfcSoportado()) {
    return null;
  }

  async function escanear(): Promise<void> {
    setEstado("leyendo");
    setMensaje(null);

    try {
      const lector = new window.NDEFReader();

      lector.onreadingerror = () => {
        setEstado("error");
        setMensaje("No se pudo leer el sticker. Volvé a intentarlo.");
      };

      lector.onreading = async (evento) => {
        const slug = extraerSlugDeRecords(evento.message.records);
        await lectorRef.current?.stop();

        if (slug) {
          onSlugLeido(slug);
          setEstado("inactivo");
        } else {
          setEstado("error");
          setMensaje("El sticker no corresponde a un servicio. Probá otro.");
        }
      };

      lectorRef.current = lector;
      await lector.scan();
    } catch {
      setEstado("error");
      setMensaje(
        "No se pudo activar el escáner. Comprobá que el NFC esté encendido o elegí el servicio a mano."
      );
    }
  }

  if (estado === "leyendo") {
    return (
      <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-sm font-medium text-indigo-700">
        Acercá el sticker al celular...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={escanear}
        className="rounded-full border border-dashed border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
      >
        Escanear sticker
      </button>
      {estado === "error" && mensaje && (
        <p className="text-sm text-red-600">{mensaje}</p>
      )}
    </div>
  );
}
