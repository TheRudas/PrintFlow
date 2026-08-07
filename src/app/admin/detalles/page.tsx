import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  inicioDelDia,
  inicioDeSemana,
  inicioDelMes,
} from "@/lib/fechas";
import { esAdmin, obtenerUsuarioActual } from "@/lib/auth/acciones";
import {
  obtenerVentasDetalladasPorDia,
  obtenerDesgloseConFechas,
  obtenerKpis,
  obtenerHistorialPaginado,
} from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";
import { nombreUsuario } from "@/lib/formatear";
import MenuUsuario from "@/components/ui/MenuUsuario";
import RefrescarEnMedianoche from "@/components/ui/RefrescarEnMedianoche";
import SincronizarTiempoReal from "@/components/ui/SincronizarTiempoReal";
import DetallesClient from "@/components/admin/detalles/DetallesClient";

export const dynamic = "force-dynamic";

function buscarUltimoDelMes(fecha: Date): Date {
  return new Date(Date.UTC(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth(),
    fecha.getUTCDate() + 1,
    5, 0, 0
  ));
}

export default async function PaginaDetalles(props: PageProps<"/admin/detalles">) {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const periodo = searchParams.periodo;
  const paramDesde = typeof searchParams.fechaDesde === "string" ? searchParams.fechaDesde : "";
  const paramHasta = typeof searchParams.fechaHasta === "string" ? searchParams.fechaHasta : "";

  const hoy = new Date();

  let desdeKpi: Date;
  let hastaKpi: Date;
  let desdeGrafica: Date;
  let hastaGrafica: Date;

  if (periodo === "hoy") {
    desdeKpi = inicioDelDia();
    hastaKpi = buscarUltimoDelMes(hoy);
    desdeGrafica = desdeKpi;
    hastaGrafica = hastaKpi;
  } else if (periodo === "semana") {
    desdeKpi = inicioDeSemana();
    hastaKpi = buscarUltimoDelMes(hoy);
    desdeGrafica = inicioDeSemana();
    hastaGrafica = new Date(Date.UTC(
      desdeGrafica.getUTCFullYear(),
      desdeGrafica.getUTCMonth(),
      desdeGrafica.getUTCDate() + 7,
      5, 0, 0
    ));
  } else if (periodo === "mes") {
    desdeKpi = inicioDelMes();
    hastaKpi = buscarUltimoDelMes(hoy);
    desdeGrafica = inicioDelMes();
    const mesSig = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 1, 5, 0, 0));
    hastaGrafica = mesSig;
  } else if (periodo === "todo") {
    desdeKpi = new Date(Date.UTC(2025, 0, 1, 5, 0, 0));
    hastaKpi = buscarUltimoDelMes(hoy);
    desdeGrafica = new Date(Date.UTC(hoy.getUTCFullYear(), 0, 1, 5, 0, 0));
    hastaGrafica = buscarUltimoDelMes(hoy);
  } else if (paramDesde || paramHasta) {
    desdeKpi = new Date(`${paramDesde}T05:00:00.000Z`);
    hastaKpi = new Date(`${paramHasta}T05:00:00.000Z`);
    hastaKpi.setDate(hastaKpi.getDate() + 1);
    desdeGrafica = desdeKpi;
    hastaGrafica = hastaKpi;
  } else {
    desdeKpi = inicioDelMes();
    hastaKpi = buscarUltimoDelMes(hoy);
    desdeGrafica = new Date(Date.UTC(hoy.getUTCFullYear(), 0, 1, 5, 0, 0));
    hastaGrafica = buscarUltimoDelMes(hoy);
  }

  const { perfil, correo } = await obtenerUsuarioActual();

  const [ventasDetalladas, desglose, kpis, historial, servicios] = await Promise.all([
    obtenerVentasDetalladasPorDia(desdeGrafica, hastaGrafica),
    obtenerDesgloseConFechas(desdeKpi, hastaKpi),
    obtenerKpis(desdeKpi, hastaKpi),
    obtenerHistorialPaginado(0, 50),
    obtenerTodosLosServicios(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="btn-feedback rounded-full border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto-suave hover:bg-superficie-alta"
          >
            ← Panel
          </Link>
          <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Detalles
          </h1>
        </div>
        <div className="flex gap-2">
          {perfil?.nombre && (
            <span className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm font-semibold text-texto-suave">
              {nombreUsuario(correo, perfil?.nombre)}
            </span>
          )}
          <MenuUsuario />
        </div>
      </div>

      <div className="w-full max-w-6xl">
        <Suspense fallback={<div className="flex h-64 items-center justify-center text-sm text-texto-suave">Cargando...</div>}>
          <DetallesClient
            kpis={kpis}
            ventasDetalladas={ventasDetalladas}
            desglose={desglose}
            registros={historial.registros}
            servicios={servicios}
            fechaDesde={desdeGrafica.toISOString()}
            fechaHasta={hastaGrafica.toISOString()}
          />
        </Suspense>
      </div>

      <RefrescarEnMedianoche />
      <SincronizarTiempoReal />
    </main>
  );
}
