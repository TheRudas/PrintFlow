import Link from "next/link";
import { formatearMoneda } from "@/lib/formatear";
import type { Registro, Servicio } from "@/lib/types";

interface Props {
  registros: Registro[];
  servicios: Servicio[];
}

function nombreDeServicio(
  servicioId: string,
  servicios: Servicio[]
): string {
  const servicio = servicios.find((item) => item.id === servicioId);
  return servicio?.nombre ?? "Servicio eliminado";
}

function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UltimasVentas({ registros, servicios }: Props) {
  return (
    <section className="flex w-full max-w-md flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">
        Historial
      </h2>

      {registros.length === 0 ? (
        <p className="text-sm text-texto-suave">Aún no hay ventas.</p>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
          {registros.map((registro) => (
            <div
              key={registro.id}
              className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-texto">
                  {nombreDeServicio(registro.servicio_id, servicios)}
                </p>
                <p className="text-xs text-texto-suave">
                  {formatearFecha(registro.creado_en)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-texto">
                  {formatearMoneda(registro.total)}
                </p>
                <p className="text-xs text-texto-suave">
                  {registro.cantidad} ×{" "}
                  {formatearMoneda(registro.precio_unitario)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/historial"
        className="text-center text-sm font-medium text-marca-600 underline hover:text-marca-500 dark:text-marca-400"
      >
        Abrir historial completo
      </Link>
    </section>
  );
}
