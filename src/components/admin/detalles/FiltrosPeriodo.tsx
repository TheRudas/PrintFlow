"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  fechaDesde: string;
  fechaHasta: string;
  onCambiarFechas: (desde: string, hasta: string) => void;
  periodoActual: "hoy" | "semana" | "mes" | "todo" | "personalizado";
  onCambiarPeriodo: (
    periodo: "hoy" | "semana" | "mes" | "todo" | "personalizado"
  ) => void;
}

const PERIODOS: Array<{
  valor: "hoy" | "semana" | "mes" | "todo" | "personalizado";
  etiqueta: string;
}> = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
  { valor: "todo", etiqueta: "Todo" },
];

export default function FiltrosPeriodo({
  fechaDesde,
  fechaHasta,
  onCambiarFechas,
  periodoActual,
  onCambiarPeriodo,
}: Props) {
  const [desde, setDesde] = useState(fechaDesde.slice(0, 10));
  const [hasta, setHasta] = useState(fechaHasta.slice(0, 10));
  const mostrarFechas = periodoActual === "personalizado";
  const primeraVez = useRef(true);

  useEffect(() => {
    if (!primeraVez.current && mostrarFechas) {
      return;
    }
    primeraVez.current = false;

    const hoy = new Date().toISOString().slice(0, 10);
    setDesde(fechaDesde.slice(0, 10) || hoy);
    setHasta(fechaHasta.slice(0, 10) || hoy);
  }, [fechaDesde, fechaHasta, mostrarFechas]);

  function aplicar(): void {
    onCambiarFechas(`${desde}T05:00:00.000Z`, `${hasta}T05:00:00.000Z`);
    onCambiarPeriodo("personalizado");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            onClick={() => {
              onCambiarPeriodo(p.valor);
              if (p.valor !== "personalizado") {
                setDesde("");
                setHasta("");
              }
            }}
            className={`btn-feedback rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${
              periodoActual === p.valor
                ? "glow-marca border-marca-500 bg-marca-500 text-white"
                : "border-borde bg-superficie text-texto hover:border-marca-300"
            }`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {mostrarFechas && (
        <div className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-texto-suave">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto focus:border-marca-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-texto-suave">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto focus:border-marca-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={aplicar}
            disabled={!desde || !hasta}
            className="btn-feedback rounded-xl border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 disabled:opacity-40 dark:text-marca-300"
          >
            Filtrar
          </button>
        </div>
      )}
    </div>
  );
}
