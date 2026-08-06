import type { Servicio } from "@/lib/types";

interface Props {
  servicios: Servicio[];
  seleccionadoId: string | null;
  onSeleccionar: (servicio: Servicio) => void;
}

const SLUG_USO_CASA = "uso-casa";

function IconoImpresora({ esColor }: { esColor: boolean }) {
  const gradienteRgb = (
    <defs>
      <linearGradient id="grad-rgb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  );
  const trazo = esColor ? "url(#grad-rgb)" : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {esColor && gradienteRgb}
      <path d="M6 9V3h12v6" stroke={trazo} />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke={trazo} />
      <rect x="6" y="14" width="12" height="8" rx="1" fill={esColor ? "url(#grad-rgb)" : "currentColor"} stroke="none" />
    </svg>
  );
}

function IconoCasa() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 10 12 3l9 7" />
      <path d="M5 9v12h14V9" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
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
        const esColor = servicio.slug.endsWith("color");
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
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                seleccionado
                  ? "bg-white text-zinc-900 dark:bg-marca-700 dark:text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {esUsoDeCasa ? (
                <IconoCasa />
              ) : (
                <IconoImpresora esColor={esColor} />
              )}
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
