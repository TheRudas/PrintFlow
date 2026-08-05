import { redirect } from "next/navigation";
import Link from "next/link";
import CerrarSesion from "@/components/auth/CerrarSesion";
import BotonTema from "@/components/ui/BotonTema";
import { esAdmin, listarPerfiles } from "@/lib/auth/acciones";
import {
  obtenerTotalesCombinados,
  obtenerDesglosePorServicio,
  obtenerHistorialPaginado,
} from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";
import TarjetaTotal from "@/components/admin/TarjetaTotal";
import DesgloseServicios from "@/components/admin/DesgloseServicios";
import HistorialRegistros from "@/components/admin/HistorialRegistros";
import ListaServicios from "@/components/admin/ListaServicios";
import GestionCuentas from "@/components/admin/GestionCuentas";

export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const [
    totales,
    desglose,
    historial,
    servicios,
    perfiles,
  ] = await Promise.all([
    obtenerTotalesCombinados(),
    obtenerDesglosePorServicio(),
    obtenerHistorialPaginado(0),
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
          <BotonTema />
          <CerrarSesion />
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
        <DesgloseServicios items={desglose} />
      </section>

      <section className="w-full max-w-2xl">
        <HistorialRegistros
          historialInicial={historial}
          servicios={servicios}
        />
      </section>

      <section className="w-full max-w-2xl">
        <GestionCuentas perfiles={perfiles} />
      </section>

      <section className="w-full max-w-2xl">
        <ListaServicios servicios={servicios} />
      </section>
    </main>
  );
}
