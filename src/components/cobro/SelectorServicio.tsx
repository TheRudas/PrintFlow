import type { Servicio } from "@/lib/types";

interface Props {
  servicios: Servicio[];
  seleccionadoId: string | null;
  onSeleccionar: (servicio: Servicio) => void;
}

const SLUG_USO_CASA = "uso-casa";

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
            className={`btn-feedback flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-4 text-center ${
              esUsoDeCasa ? "col-span-2" : ""
            } ${
              seleccionado
                ? "border-marca-500 bg-marca-50"
                : "border-borde bg-superficie hover:border-marca-300"
            }`}
          >
            <span className="font-semibold text-texto">
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
