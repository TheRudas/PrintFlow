import type { Servicio } from "@/lib/types";

interface Props {
  servicios: Servicio[];
  seleccionadoId: string | null;
  onSeleccionar: (servicio: Servicio) => void;
}

const SLUG_USO_CASA = "uso-casa";

function iconoPara(slug: string): string {
  if (slug.includes("fotocopia")) {
    return "▦";
  }
  if (slug === SLUG_USO_CASA) {
    return "⌂";
  }
  return "▤";
}

export default function SelectorServicio({
  servicios,
  seleccionadoId,
  onSeleccionar,
}: Props) {
  if (servicios.length === 0) {
    return (
      <p className="text-sm text-texto-suave">
        No hay servicios configurados. Contactá al administrador.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {servicios.map((servicio) => {
        const seleccionado = servicio.id === seleccionadoId;
        const esUsoDeCasa = servicio.slug === SLUG_USO_CASA;
        return (
          <button
            key={servicio.id}
            type="button"
            onClick={() => onSeleccionar(servicio)}
            className={`btn-feedback animar-entrada sombra-suave flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-200 ${
              esUsoDeCasa ? "col-span-2" : ""
            } ${
              seleccionado
                ? "border-marca-500 bg-marca-100 dark:bg-marca-100"
                : "border-borde bg-superficie hover:-translate-y-0.5 hover:border-marca-300"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${
                seleccionado
                  ? "bg-marca-600 text-white"
                  : "bg-marca-100 text-marca-600 dark:bg-marca-100 dark:text-marca-300"
              }`}
            >
              {iconoPara(servicio.slug)}
            </span>
            <span className="font-semibold leading-tight text-texto">
              {servicio.nombre}
            </span>
            <span className="text-xs text-texto-suave">
              por {servicio.unidad}
            </span>
          </button>
        );
      })}
    </div>
  );
}
