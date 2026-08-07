"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { crearRegistro } from "@/lib/repos/registros";
import type { Servicio } from "@/lib/types";
import SelectorServicio from "./SelectorServicio";
import SelectorPrecio from "./SelectorPrecio";
import ContadorCantidad from "./ContadorCantidad";
import ResumenTotal from "./ResumenTotal";
import TituloSeccion from "./TituloSeccion";
import ConfirmarVenta from "./ConfirmarVenta";
import RefrescarEnMedianoche from "@/components/ui/RefrescarEnMedianoche";
import SincronizarTiempoReal from "@/components/ui/SincronizarTiempoReal";
import Toast, { type TipoToast } from "@/components/ui/Toast";

interface Props {
  servicios: Servicio[];
  servicioInicialId: string | null;
  usuarioId: string | null;
}

type EstadoToast = { tipo: TipoToast; mensaje: string } | null;

const SLUG_USO_CASA = "uso-casa";

function servicioInicial(servicios: Servicio[], servicioInicialId: string | null): Servicio | null {
  if (!servicioInicialId) {
    return null;
  }
  return servicios.find((item) => item.id === servicioInicialId) ?? null;
}

export default function PantallaCobro({
  servicios,
  servicioInicialId,
  usuarioId,
}: Props) {
  const [servicio, setServicio] = useState<Servicio | null>(() =>
    servicioInicial(servicios, servicioInicialId)
  );
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(() => {
    const inicial = servicioInicial(servicios, servicioInicialId);
    if (!inicial) {
      return null;
    }
    return inicial.slug === SLUG_USO_CASA ? 0 : inicial.precio_por_defecto;
  });
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);
  const [toast, setToast] = useState<EstadoToast>(null);
  const router = useRouter();

  const esUsoDeCasa = useCallback((candidato: Servicio): boolean => {
    return candidato.slug === SLUG_USO_CASA;
  }, []);

  const seleccionarServicio = useCallback(
    (nuevoServicio: Servicio): void => {
      setServicio(nuevoServicio);
      setPrecioUnitario(
        esUsoDeCasa(nuevoServicio) ? 0 : nuevoServicio.precio_por_defecto
      );
      setCantidad(1);
      setToast(null);
    },
    [esUsoDeCasa]
  );

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
    if (!servicio) {
      return;
    }

    const esCasa = esUsoDeCasa(servicio);
    const precioEfectivo = esCasa ? 0 : precioUnitario;

    if (!esCasa && (precioUnitario === null || precioUnitario <= 0)) {
      return;
    }

    setGuardando(true);
    setToast(null);

    try {
      await crearRegistro({
        servicioId: servicio.id,
        cantidad,
        precioUnitario: precioEfectivo as number,
        total: (precioEfectivo as number) * cantidad,
        esCasa,
      });
      setToast({ tipo: "exito", mensaje: esCasa ? "Uso de la casa registrado" : "Venta registrada" });
      setPrecioUnitario(esCasa ? 0 : servicio.precio_por_defecto);
      setCantidad(1);
      router.refresh();
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
      <section className="flex flex-col gap-3">
        <TituloSeccion>Elige el servicio</TituloSeccion>
        <SelectorServicio
          servicios={servicios}
          seleccionadoId={servicio?.id ?? null}
          onSeleccionar={seleccionarServicio}
        />
      </section>

      {servicio && (
        <>
          {!esUsoDeCasa(servicio) && (
            <section className="flex flex-col gap-3">
              <TituloSeccion>Precio</TituloSeccion>
              <SelectorPrecio
                servicio={servicio}
                precioSeleccionado={precioUnitario}
                onSeleccionarPrecio={seleccionarPrecio}
                onEscribirPrecio={escribirPrecio}
              />
            </section>
          )}

          <section className="flex flex-col gap-3">
            <TituloSeccion>Cantidad</TituloSeccion>
            <ContadorCantidad
              cantidad={cantidad}
              onCambiarCantidad={cambiarCantidad}
            />
          </section>

          <ResumenTotal
            precioUnitario={precioUnitario}
            cantidad={cantidad}
            guardando={guardando}
            esCasa={servicio ? esUsoDeCasa(servicio) : false}
            onGuardar={() => setMostrandoConfirmacion(true)}
          />
        </>
      )}

      {mostrandoConfirmacion && servicio && (
        <ConfirmarVenta
          nombreServicio={servicio.nombre}
          precioUnitario={precioUnitario}
          cantidad={cantidad}
          esCasa={esUsoDeCasa(servicio)}
          onConfirmar={() => {
            setMostrandoConfirmacion(false);
            guardarVenta();
          }}
          onCancelar={() => setMostrandoConfirmacion(false)}
        />
      )}

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => setToast(null)}
        />
      )}
      <RefrescarEnMedianoche />
      <SincronizarTiempoReal perfilId={usuarioId} />
    </div>
  );
}
