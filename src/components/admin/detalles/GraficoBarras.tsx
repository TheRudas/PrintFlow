"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { formatearMoneda } from "@/lib/formatear";
import type { VentaPorDiaServicio } from "@/lib/types";

interface Props {
  detallado: VentaPorDiaServicio[];
  periodo: "hoy" | "semana" | "mes" | "todo" | "personalizado";
}

type Modo = "general" | "detallado";

const COLORES: Record<string, string> = {
  "impresion bn": "#7c3aed",
  "fotocopia bn": "#ec4899",
  "impresion color": "#84cc16",
  "fotocopia color": "#6b7280",
};

const NOMBRES: Record<string, string> = {
  "impresion bn": "Imp B/N",
  "fotocopia bn": "Foto B/N",
  "impresion color": "Imp Color",
  "fotocopia color": "Foto Color",
};

const SLUGS = Object.keys(COLORES);

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function normalizarSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

function formatearValor(v: number): string {
  if (v === 0) return "";
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v}`;
}

function fechaFormateada(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rangoSemana(num: number, año: number, mes: number): string {
  const desde = (num - 1) * 7 + 1;
  const ultimoDia = new Date(año, mes + 1, 0).getDate();
  const hasta = Math.min(num * 7, ultimoDia);
  return `${String(desde).padStart(2, "0")}-${String(hasta).padStart(2, "0")}`;
}

type FilaAgregada = {
  etiqueta: string;
  etiquetaTooltip: string;
  montoTotal: number;
  [slug: string]: number | string;
};

export default function GraficoBarras({ detallado, periodo }: Props) {
  const [modo, setModo] = useState<Modo>("general");

  const esSemana = periodo === "semana";
  const esMes = periodo === "mes";
  const esTodo = periodo === "todo";
  const esHoy = periodo === "hoy";

  const datosAgregados = useMemo<FilaAgregada[]>(() => {
    const mapaRaw = new Map<string, Record<string, number>>();
    let añoMes: { año: number; mes: number } | null = null;

    for (const d of detallado) {
      let clave: string;

      const fechaStr = d.fecha.slice(5);

      if (!añoMes && d.fecha.length >= 7) {
        añoMes = {
          año: Number(d.fecha.slice(0, 4)),
          mes: Number(d.fecha.slice(5, 7)) - 1,
        };
      }

      if (esMes) {
        const dia = new Date(d.fecha + "T12:00:00").getDate();
        clave = String(Math.ceil(dia / 7));
      } else if (esTodo) {
        clave = MESES[new Date(d.fecha + "T12:00:00").getMonth()];
      } else {
        clave = fechaStr;
      }

      const slug = normalizarSlug(d.slug);
      if (!mapaRaw.has(clave)) {
        mapaRaw.set(clave, {});
      }
      const fila = mapaRaw.get(clave)!;
      fila[slug] = (fila[slug] ?? 0) + d.montoTotal;
    }

    function totalFila(fila: Record<string, number>): number {
      let t = 0;
      for (const s of SLUGS) t += fila[s] ?? 0;
      return t;
    }

    if (esMes) {
      const semanas = Array.from(mapaRaw.keys()).sort((a, b) =>
        Number(a) - Number(b)
      );
      return semanas.map((num) => {
        const datosSem = mapaRaw.get(num) ?? {};
        const montoTotal = totalFila(datosSem);
        const n = Number(num);
        const rango = añoMes
          ? rangoSemana(n, añoMes.año, añoMes.mes)
          : `S${num}`;
        return {
          etiqueta: rango,
          etiquetaTooltip: `Semana del ${rango}`,
          montoTotal,
          ...Object.fromEntries(SLUGS.map((s) => [s, datosSem[s] ?? 0])),
        };
      });
    }

    if (esTodo) {
      return MESES.map((mes) => {
        const datosMes = mapaRaw.get(mes) ?? {};
        const montoTotal = totalFila(datosMes);
        return {
          etiqueta: mes,
          etiquetaTooltip: mes,
          montoTotal,
          ...Object.fromEntries(SLUGS.map((s) => [s, datosMes[s] ?? 0])),
        };
      });
    }

    if (esHoy) {
      const claves = Array.from(mapaRaw.keys());
      return [
        {
          etiqueta: "Hoy",
          etiquetaTooltip: claves.length > 0 ? `Hoy (${fechaFormateada("2000-" + claves[0])})` : "Hoy",
          montoTotal: totalFila(mapaRaw.get(claves[0]) ?? {}),
          ...Object.fromEntries(SLUGS.map((s) => [s, (mapaRaw.get(claves[0]) ?? {})[s] ?? 0])),
        },
      ];
    }

    const ordenado = Array.from(mapaRaw.keys()).sort();
    return ordenado.map((clave) => {
      const fila = mapaRaw.get(clave)!;
      const montoTotal = totalFila(fila);
      const etiqueta = clave;
      const tooltip = esSemana
        ? `Día ${fechaFormateada("2000-" + clave)}`
        : `Día ${clave}`;
      return {
        etiqueta,
        etiquetaTooltip: tooltip,
        montoTotal,
        ...Object.fromEntries(SLUGS.map((s) => [s, fila[s] ?? 0])),
      };
    });
  }, [detallado, esSemana, esMes, esTodo, esHoy]);

  if (detallado.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-texto-suave">
        Sin datos en este período
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setModo("general")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            modo === "general"
              ? "bg-marca-500 text-white"
              : "bg-superficie-alta text-texto-suave hover:text-texto"
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setModo("detallado")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            modo === "detallado"
              ? "bg-marca-500 text-white"
              : "bg-superficie-alta text-texto-suave hover:text-texto"
          }`}
        >
          Detallado
        </button>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={datosAgregados} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-borde, #e5e7eb)" />
          <XAxis
            dataKey="etiqueta"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={(v: number) => formatearMoneda(v)}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value, name) => [
              formatearMoneda(Number(value)),
              NOMBRES[name as string] ?? name,
            ]}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.etiquetaTooltip ?? label
            }
            contentStyle={{
              borderRadius: "1rem",
              border: "1px solid var(--color-borde, #e5e7eb)",
              background: "var(--color-superficie, #fff)",
              fontSize: "0.875rem",
            }}
          />
          {modo === "general" ? (
            <Bar
              dataKey="montoTotal"
              fill="#7c3aed"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="montoTotal"
                position="top"
                formatter={(v: unknown) => formatearValor(Number(v))}
                style={{ fontSize: 11, fontWeight: 600, fill: "var(--color-texto-suave, #6b7280)" }}
              />
            </Bar>
          ) : (
            SLUGS.map((slug, i) => (
              <Bar
                key={slug}
                dataKey={slug}
                stackId="a"
                fill={COLORES[slug]}
                name={NOMBRES[slug]}
                animationDuration={800}
                animationEasing="ease-out"
                radius={i === SLUGS.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
