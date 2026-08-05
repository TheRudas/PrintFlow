"use client";

import { useState } from "react";
import {
  actualizarServicioComoAdmin,
  crearServicioComoAdmin,
} from "@/lib/admin/acciones";
import type { DatosServicio, Servicio } from "@/lib/types";

interface Props {
  servicio: Servicio | null;
  onGuardado: () => void;
}

function textoDePresets(presets: number[]): string {
  return presets.join(", ");
}

function normalizarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FormularioServicio({ servicio, onGuardado }: Props) {
  const [nombre, setNombre] = useState(servicio?.nombre ?? "");
  const [slug, setSlug] = useState(servicio?.slug ?? "");
  const [precioPorDefecto, setPrecioPorDefecto] = useState(
    servicio?.precio_por_defecto?.toString() ?? ""
  );
  const [presets, setPresets] = useState(
    textoDePresets(servicio?.presets ?? [])
  );
  const [unidad, setUnidad] = useState(servicio?.unidad ?? "hoja");
  const [activo, setActivo] = useState(servicio?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function parsearPresets(texto: string): number[] {
    return texto
      .split(",")
      .map((valor) => Number(valor.trim()))
      .filter((valor) => Number.isFinite(valor) && valor > 0);
  }

  async function manejarEnvio(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setGuardando(true);
    setError(null);

    const datos: DatosServicio = {
      nombre: nombre.trim(),
      slug: normalizarSlug(slug),
      precioPorDefecto:
        precioPorDefecto.trim() === ""
          ? null
          : Number(precioPorDefecto),
      presets: parsearPresets(presets),
      unidad: unidad.trim() === "" ? "hoja" : unidad.trim(),
      activo,
    };

    const resultado = servicio
      ? await actualizarServicioComoAdmin(servicio.id, datos)
      : await crearServicioComoAdmin(datos);

    if (resultado.exito) {
      onGuardado();
    } else {
      setError(resultado.error ?? "No se pudo guardar");
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="font-semibold text-zinc-900">
        {servicio ? "Editar servicio" : "Nuevo servicio"}
      </h2>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          required
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Slug (para el sticker NFC)
        <input
          type="text"
          value={slug}
          onChange={(evento) => setSlug(evento.target.value)}
          required
          disabled={servicio !== null}
          placeholder="impresion-a3-color"
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-marca-500 focus:outline-none disabled:bg-zinc-100 disabled:text-zinc-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Precio por defecto
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={precioPorDefecto}
          onChange={(evento) => setPrecioPorDefecto(evento.target.value)}
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Presets (separados por coma)
        <input
          type="text"
          value={presets}
          onChange={(evento) => setPresets(evento.target.value)}
          placeholder="300, 700, 1000"
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Unidad
        <input
          type="text"
          value={unidad}
          onChange={(evento) => setUnidad(evento.target.value)}
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input
          type="checkbox"
          checked={activo}
          onChange={(evento) => setActivo(evento.target.checked)}
          className="h-4 w-4 accent-marca-500"
        />
        Activo (visible en la pantalla de cobro)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="btn-feedback gradiente-marca rounded-full py-3 font-medium text-white disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

