import { formatearMoneda } from "@/lib/formatear";
import type { DesgloseServicio } from "@/lib/types";
import TituloSeccionAdmin from "./TituloSeccionAdmin";

interface Props {
  items: DesgloseServicio[];
}

export default function DesgloseServicios({ items }: Props) {
  const montoTotal = items.reduce((suma, item) => suma + item.montoTotal, 0);

  return (
    <section className="animar-entrada flex w-full max-w-2xl flex-col gap-3">
      <TituloSeccionAdmin>Por servicio</TituloSeccionAdmin>

      <div className="sombra-suave flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
        {items.length === 0 ? (
          <p className="px-4 py-4 text-sm text-texto-suave">
            Aún no hay ventas para mostrar.
          </p>
        ) : (
          <ul>
            {items.map((item) => {
              const porcentaje = montoTotal > 0
                ? Math.round((item.montoTotal / montoTotal) * 100)
                : 0;
              return (
                <li
                  key={item.servicioId}
                  className="flex items-center justify-between border-b border-borde px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-texto">{item.nombre}</p>
                    <p className="text-xs text-texto-suave">
                      {item.cantidad} registro{item.cantidad === 1 ? "" : "s"}
                      {porcentaje > 0 && (
                        <span className="ml-2 rounded-full bg-marca-100 px-2 py-0.5 text-[10px] font-semibold text-marca-700 dark:text-marca-300">
                          {porcentaje}%
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="font-semibold text-texto">
                    {formatearMoneda(item.montoTotal)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
