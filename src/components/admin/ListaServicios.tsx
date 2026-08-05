"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarServicioComoAdmin } from "@/lib/admin/acciones";
import { formatearMoneda } from "@/lib/formatear";
import type { Servicio } from "@/lib/types";
import FormularioServicio from "./FormularioServicio";

interface Props {
  servicios: Servicio[];
}

export default function ListaServicios({ servicios }: Props) {
  const [servicioEnEdicion, setServicioEnEdicion] =
    useState<Servicio | null>(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function alternarActivo(servicio: Servicio): Promise<void> {
    setError(null);
    const resultado = await actualizarServicioComoAdmin(servicio.id, {
      activo: !servicio.activo,
    });

    if (resultado.exito) {
      router.refresh();
    } else {
      setError(resultado.error ?? "No se pudo actualizar");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">Servicios</h2>
        <button
          type="button"
          onClick={() => {
            setCreando(true);
            setServicioEnEdicion(null);
          }}
          className="btn-feedback rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
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
            router.refresh();
          }}
        />
      )}

      {servicioEnEdicion && (
        <FormularioServicio
          servicio={servicioEnEdicion}
          onGuardado={() => {
            setServicioEnEdicion(null);
            router.refresh();
          }}
        />
      )}

      <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-texto">
                {servicio.nombre}
                {!servicio.activo && (
                  <span className="ml-2 rounded-full bg-superficie-alta px-2 py-0.5 text-xs text-texto-suave">
                    inactivo
                  </span>
                )}
              </p>
              <p className="text-xs text-texto-suave">
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
                className="btn-feedback rounded-full border border-marca-200 px-3 py-1.5 text-sm font-medium text-marca-700 hover:bg-marca-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => alternarActivo(servicio)}
                className={`btn-feedback rounded-full border px-3 py-1.5 text-sm font-medium ${
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
