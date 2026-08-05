import { formatearMoneda } from "@/lib/formatear";
import type { Servicio } from "@/lib/types";

interface Props {
  servicio: Servicio;
  precioSeleccionado: number | null;
  onSeleccionarPrecio: (precio: number) => void;
  onEscribirPrecio: (precio: number | null) => void;
}

export default function SelectorPrecio({
  servicio,
  precioSeleccionado,
  onSeleccionarPrecio,
  onEscribirPrecio,
}: Props) {
  const tienePresets = servicio.presets.length > 0;
  const tienePrecioPorDefecto = servicio.precio_por_defecto !== null;

  function esSeleccionado(precio: number): boolean {
    return precioSeleccionado !== null && precioSeleccionado === precio;
  }

  function manejarMontoLibre(valor: string): void {
    const monto = valor === "" ? null : Number(valor);
    onEscribirPrecio(monto);
  }

  return (
    <div className="flex flex-col gap-3">
      {tienePresets && (
        <div className="flex flex-wrap gap-2">
          {servicio.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSeleccionarPrecio(preset)}
              className={`btn-feedback rounded-full border-2 px-5 py-3 text-base font-semibold ${
                esSeleccionado(preset)
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300"
              }`}
            >
              {formatearMoneda(preset)}
            </button>
          ))}
        </div>
      )}

      {tienePrecioPorDefecto && (
        <button
          type="button"
          onClick={() =>
            onSeleccionarPrecio(servicio.precio_por_defecto as number)
          }
          className={`btn-feedback rounded-full border-2 px-5 py-3 text-base font-semibold ${
            esSeleccionado(servicio.precio_por_defecto as number)
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300"
          }`}
        >
          {formatearMoneda(servicio.precio_por_defecto as number)}
        </button>
      )}

      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="Monto libre..."
        value={precioSeleccionado === null ? "" : precioSeleccionado}
        onChange={(evento) => manejarMontoLibre(evento.target.value)}
        className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-lg text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none"
      />
    </div>
  );
}
