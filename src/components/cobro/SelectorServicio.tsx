import type { Servicio } from "@/lib/types";

interface Props {
  servicios: Servicio[];
  seleccionadoId: string | null;
  onSeleccionar: (servicio: Servicio) => void;
}

export default function SelectorServicio({
  servicios,
  seleccionadoId,
  onSeleccionar,
}: Props) {
  if (servicios.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No hay servicios configurados. Contactá al administrador.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {servicios.map((servicio) => {
        const seleccionado = servicio.id === seleccionadoId;
        return (
          <button
            key={servicio.id}
            type="button"
            onClick={() => onSeleccionar(servicio)}
            className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-4 text-center transition-colors ${
              seleccionado
                ? "border-indigo-600 bg-indigo-50"
                : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <span className="font-semibold text-zinc-900">
              {servicio.nombre}
            </span>
            <span className="text-xs text-zinc-500">
              por {servicio.unidad}
            </span>
          </button>
        );
      })}
    </div>
  );
}
