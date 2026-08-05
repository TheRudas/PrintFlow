"use client";

import { useEffect, useRef, useState } from "react";
import { crearRegistro } from "@/lib/repos/registros";
import type { Servicio } from "@/lib/types";
import SelectorServicio from "./SelectorServicio";
import SelectorPrecio from "./SelectorPrecio";
import ContadorCantidad from "./ContadorCantidad";
import ResumenTotal from "./ResumenTotal";
import BotonEscanear from "./BotonEscanear";

interface Props {
  servicios: Servicio[];
  servicioInicialId: string | null;
}

export default function PantallaCobro({
  servicios,
  servicioInicialId,
}: Props) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const servicioInicialAplicado = useRef(false);

  useEffect(() => {
    if (servicioInicialId && !servicioInicialAplicado.current) {
      const servicioEncontrado = servicios.find(
        (item) => item.id === servicioInicialId
      );
      if (servicioEncontrado) {
        seleccionarServicio(servicioEncontrado);
        servicioInicialAplicado.current = true;
      }
    }
  }, [servicioInicialId, servicios]);

  function seleccionarServicio(nuevoServicio: Servicio): void {
    setServicio(nuevoServicio);
    setPrecioUnitario(nuevoServicio.precio_por_defecto);
    setCantidad(1);
    setNota("");
    setMensaje(null);
  }

  function seleccionarPrecio(precio: number): void {
    setPrecioUnitario(precio);
  }

  function escribirPrecio(precio: number | null): void {
    setPrecioUnitario(precio);
  }

  function cambiarCantidad(nuevaCantidad: number): void {
    if (nuevaCantidad >= 1) {
      setCantidad(nuevaCantidad);
    }
  }

  function manejarSlugLeido(slug: string): void {
    const servicioEncontrado = servicios.find(
      (item) => item.slug === slug
    );
    if (servicioEncontrado) {
      seleccionarServicio(servicioEncontrado);
    } else {
      setMensaje("Este servicio ya no está disponible");
    }
  }

  async function guardarVenta(): Promise<void> {
    if (!servicio || precioUnitario === null || precioUnitario <= 0) {
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      await crearRegistro({
        servicioId: servicio.id,
        cantidad,
        precioUnitario,
        total: precioUnitario * cantidad,
        nota: nota.trim() === "" ? null : nota.trim(),
      });
      setMensaje("Venta registrada");
      setPrecioUnitario(servicio.precio_por_defecto);
      setCantidad(1);
      setNota("");
    } catch (error) {
      setMensaje(
        `No se pudo guardar: ${error instanceof Error ? error.message : "error de conexión"}`
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500">
          Elegí el servicio
        </h2>
        <BotonEscanear onSlugLeido={manejarSlugLeido} />
        <SelectorServicio
          servicios={servicios}
          seleccionadoId={servicio?.id ?? null}
          onSeleccionar={seleccionarServicio}
        />
      </section>

      {servicio && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-500">Precio</h2>
            <SelectorPrecio
              servicio={servicio}
              precioSeleccionado={precioUnitario}
              onSeleccionarPrecio={seleccionarPrecio}
              onEscribirPrecio={escribirPrecio}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-500">Cantidad</h2>
            <ContadorCantidad
              cantidad={cantidad}
              onCambiarCantidad={cambiarCantidad}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-zinc-500">
              Nota (opcional)
            </h2>
            <input
              type="text"
              value={nota}
              onChange={(evento) => setNota(evento.target.value)}
              placeholder="Ej: anillado, papel especial..."
              className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none"
            />
          </section>

          <ResumenTotal
            precioUnitario={precioUnitario}
            cantidad={cantidad}
            guardando={guardando}
            mensaje={mensaje}
            onGuardar={guardarVenta}
          />
        </>
      )}
    </div>
  );
}
