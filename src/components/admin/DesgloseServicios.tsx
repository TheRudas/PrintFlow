import { formatearMoneda } from "@/lib/formatear";
import type { DesgloseServicio } from "@/lib/types";

interface Props {
  items: DesgloseServicio[];
}

export default function DesgloseServicios({ items }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
      <div className="border-b border-marca-100 bg-marca-50 px-4 py-2 text-sm font-semibold text-marca-700 dark:text-marca-300">
        Por servicio
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-4 text-sm text-texto-suave">
          Aún no hay ventas para mostrar.
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.servicioId}
              className="flex items-center justify-between border-b border-borde px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="font-medium text-texto">{item.nombre}</p>
                <p className="text-xs text-texto-suave">
                  {item.cantidad} registro{item.cantidad === 1 ? "" : "s"}
                </p>
              </div>
              <span className="font-semibold text-texto">
                {formatearMoneda(item.montoTotal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
