import { redirect } from "next/navigation";
import Link from "next/link";
import MenuUsuario from "@/components/ui/MenuUsuario";
import SincronizarTiempoReal from "@/components/ui/SincronizarTiempoReal";
import RefrescarEnMedianoche from "@/components/ui/RefrescarEnMedianoche";
import { esAdmin, listarPerfiles, obtenerUsuarioActual } from "@/lib/auth/acciones";
import { nombreUsuario } from "@/lib/formatear";
import {
  obtenerTotalesCombinados,
  obtenerTotalesGenerales,
  obtenerEstadisticasCasa,
  obtenerDesglosePorServicio,
  obtenerHistorialPaginado,
} from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";
import TarjetaTotal from "@/components/admin/TarjetaTotal";
import ResumenGeneral from "@/components/admin/ResumenGeneral";
import UsoCasa from "@/components/admin/UsoCasa";
import DesgloseServicios from "@/components/admin/DesgloseServicios";
import HistorialRegistros from "@/components/admin/HistorialRegistros";
import ListaServicios from "@/components/admin/ListaServicios";
import GestionCuentas from "@/components/admin/GestionCuentas";

const REGISTROS_EN_PANEL = 6;

export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const { perfil, correo } = await obtenerUsuarioActual();
  const nombreMostrado = nombreUsuario(correo, perfil?.nombre);

  const [
    totales,
    totalesGenerales,
    usoCasa,
    desglose,
    historial,
    servicios,
    perfiles,
  ] = await Promise.all([
    obtenerTotalesCombinados(),
    obtenerTotalesGenerales(),
    obtenerEstadisticasCasa(),
    obtenerDesglosePorServicio(),
    obtenerHistorialPaginado(0, REGISTROS_EN_PANEL),
    obtenerTodosLosServicios(),
    listarPerfiles(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Panel
        </h1>
        <div className="flex gap-2">
          {nombreMostrado && (
            <span className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm font-semibold text-texto-suave">
              {nombreMostrado}
            </span>
          )}
          <MenuUsuario />
          <Link
            href="/"
            className="btn-feedback rounded-full border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 dark:text-marca-300"
          >
            Volver
          </Link>
        </div>
      </div>

      <section className="grid w-full max-w-2xl grid-cols-3 gap-3">
        <TarjetaTotal etiqueta="Hoy" {...totales.hoy} />
        <TarjetaTotal etiqueta="Semana" {...totales.semana} />
        <TarjetaTotal etiqueta="Mes" {...totales.mes} />
      </section>

      <section className="w-full max-w-2xl">
        <Link
          href="/admin/detalles"
          className="btn-feedback glow-marca gradiente-marca flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Ver gráficas y detalles
        </Link>
      </section>

      <section className="w-full max-w-2xl">
        <ResumenGeneral totales={totalesGenerales} />
      </section>

      <section className="w-full max-w-2xl">
        <UsoCasa estadisticas={usoCasa} />
      </section>

      <section className="w-full max-w-2xl">
        <DesgloseServicios items={desglose} />
      </section>

      <section className="w-full max-w-2xl">
        <HistorialRegistros
          historialInicial={historial}
          servicios={servicios}
        />
        <div className="mt-3 text-center">
          <Link
            href="/historial"
            className="text-sm font-medium text-marca-600 underline hover:text-marca-500 dark:text-marca-400"
          >
            Abrir historial completo
          </Link>
        </div>
      </section>

      <section className="w-full max-w-2xl">
        <GestionCuentas perfiles={perfiles} />
      </section>

      <section className="w-full max-w-2xl">
        <ListaServicios servicios={servicios} />
      </section>
      <RefrescarEnMedianoche />
      <SincronizarTiempoReal />
    </main>
  );
}
