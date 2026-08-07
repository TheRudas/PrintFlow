"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { formatearMoneda } from "@/lib/formatear";
import { colorServicio } from "@/lib/coloresServicio";
import type { DesgloseServicio } from "@/lib/types";

interface Props {
  datos: DesgloseServicio[];
}

function colorParaServicio(nombre: string): string {
  return colorServicio(nombre);
}

const RADIAN = Math.PI / 180;

function etiquetaPersonalizada(props: PieLabelRenderProps): React.ReactNode {
  const { cx, cy, midAngle, innerRadius = 0, outerRadius = 0, percent = 0, name = "" } = props;

  if (typeof cx !== "number" || typeof cy !== "number" || typeof midAngle !== "number") return null;

  const pct = Math.round(percent * 100);
  if (pct < 3) return null;

  const esChico = pct < 10;
  const radius = esChico
    ? Number(outerRadius) + 12
    : Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const tamanoFuente = esChico ? 11 : 12;
  const tamanoPct = esChico ? 13 : 14;

  return (
    <text
      x={x}
      y={y}
      fill={esChico ? "var(--color-texto)" : "white"}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: tamanoFuente, fontWeight: 700, pointerEvents: "none" }}
    >
      <tspan x={x} dy="-0.5em">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em" style={{ fontSize: tamanoPct }}>
        {pct}%
      </tspan>
    </text>
  );
}

export default function GraficoTorta({ datos }: Props) {
  const datosGrafico = useMemo(
    () =>
      datos
        .filter((d) => d.montoTotal > 0)
        .map((d) => ({
          name: d.nombre,
          value: d.montoTotal,
        })),
    [datos]
  );

  const totalTorta = useMemo(
    () => datosGrafico.reduce((s, d) => s + d.value, 0),
    [datosGrafico]
  );

  if (datosGrafico.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-texto-suave">
        Sin datos en este período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <PieChart>
        <Pie
          data={datosGrafico}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={140}
          paddingAngle={0}
          dataKey="value"
          animationBegin={0}
          animationDuration={1200}
          animationEasing="ease-out"
          label={etiquetaPersonalizada}
          labelLine={false}
        >
          {datosGrafico.map((entry) => (
            <Cell
              key={entry.name}
              fill={colorParaServicio(entry.name)}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `${formatearMoneda(Number(value))} (${totalTorta > 0 ? Math.round((Number(value) / totalTorta) * 100) : 0}%)`,
            "",
          ]}
          contentStyle={{
            borderRadius: "1rem",
            border: "1px solid var(--color-borde, #e5e7eb)",
            background: "var(--color-superficie, #fff)",
            fontSize: "0.875rem",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
