"use client";

import { useState } from "react";
import { actualizarServicioComoAdmin } from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type { Servicio } from "@/lib/types";
import FormularioServicio from "./FormularioServicio";

interface Props {
  servicios: Servicio[];
  onCambio: () => void;
}

export default function ListaServicios({ servicios, onCambio }: Props) {
  const [servicioEnEdicion, setServicioEnEdicion] =
    useState<Servicio | null>(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alternarActivo(servicio: Servicio): Promise<void> {
    setError(null);
    const resultado = await actualizarServicioComoAdmin(servicio.id, {
      activo: !servicio.activo,
    });

    if (resultado.exito) {
      onCambio();
    } else {
      setError(resultado.error ?? "No se pudo actualizar");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">Servicios</h2>
        <button
          type="button"
          onClick={() => {
            setCreando(true);
            setServicioEnEdicion(null);
          }}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          + Nuevo
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {creando && (
        <FormularioServicio
          servicio={null}
          onGuardado={() => {
            setCreando(false);
            onCambio();
          }}
        />
      )}

      {servicioEnEdicion && (
        <FormularioServicio
          servicio={servicioEnEdicion}
          onGuardado={() => {
            setServicioEnEdicion(null);
            onCambio();
          }}
        />
      )}

      <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900">
                {servicio.nombre}
                {!servicio.activo && (
                  <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                    inactivo
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500">
                {servicio.presets.length > 0
                  ? servicio.presets.map(formatearMoneda).join(" · ")
                  : "Sin presets"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setServicioEnEdicion(servicio);
                  setCreando(false);
                }}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => alternarActivo(servicio)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  servicio.activo
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {servicio.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
