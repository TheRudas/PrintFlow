"use client";

import { useEffect, useRef, useState } from "react";
import { crearRegistro } from "@/lib/repos/registros";
import type { Servicio } from "@/lib/types";
import SelectorServicio from "./SelectorServicio";
import SelectorPrecio from "./SelectorPrecio";
import ContadorCantidad from "./ContadorCantidad";
import ResumenTotal from "./ResumenTotal";
import Toast, { type TipoToast } from "@/components/ui/Toast";

interface Props {
  servicios: Servicio[];
  servicioInicialId: string | null;
}

type EstadoToast = { tipo: TipoToast; mensaje: string } | null;

export default function PantallaCobro({
  servicios,
  servicioInicialId,
}: Props) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<EstadoToast>(null);
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
    setToast(null);
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

  async function guardarVenta(): Promise<void> {
    if (!servicio || precioUnitario === null || precioUnitario <= 0) {
      return;
    }

    setGuardando(true);
    setToast(null);

    try {
      await crearRegistro({
        servicioId: servicio.id,
        cantidad,
        precioUnitario,
        total: precioUnitario * cantidad,
      });
      setToast({ tipo: "exito", mensaje: "Venta registrada" });
      setPrecioUnitario(servicio.precio_por_defecto);
      setCantidad(1);
    } catch (error) {
      setToast({
        tipo: "error",
        mensaje: `No se pudo guardar: ${error instanceof Error ? error.message : "error de conexión"}`,
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">
          Elegí el servicio
        </h2>
        <SelectorServicio
          servicios={servicios}
          seleccionadoId={servicio?.id ?? null}
          onSeleccionar={seleccionarServicio}
        />
      </section>

      {servicio && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">Precio</h2>
            <SelectorPrecio
              servicio={servicio}
              precioSeleccionado={precioUnitario}
              onSeleccionarPrecio={seleccionarPrecio}
              onEscribirPrecio={escribirPrecio}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">Cantidad</h2>
            <ContadorCantidad
              cantidad={cantidad}
              onCambiarCantidad={cambiarCantidad}
            />
          </section>

          <ResumenTotal
            precioUnitario={precioUnitario}
            cantidad={cantidad}
            guardando={guardando}
            onGuardar={guardarVenta}
          />
        </>
      )}

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => setToast(null)}
        />
      )}
    </div>
  );
}
