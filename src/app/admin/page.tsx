import { redirect } from "next/navigation";
import { esAdmin } from "@/lib/admin/acciones";
import {
  obtenerTotalesDeHoy,
  obtenerTotalesDeLaSemana,
  obtenerTotalesDelMes,
  obtenerDesglosePorServicio,
  obtenerHistorialPaginado,
} from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";
import TarjetaTotal from "@/components/admin/TarjetaTotal";
import DesgloseServicios from "@/components/admin/DesgloseServicios";
import HistorialRegistros from "@/components/admin/HistorialRegistros";
import ListaServicios from "@/components/admin/ListaServicios";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const [
    totalesHoy,
    totalesSemana,
    totalesMes,
    desglose,
    historial,
    servicios,
  ] = await Promise.all([
    obtenerTotalesDeHoy(),
    obtenerTotalesDeLaSemana(),
    obtenerTotalesDelMes(),
    obtenerDesglosePorServicio(),
    obtenerHistorialPaginado(0),
    obtenerTodosLosServicios(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Panel
        </h1>
        <Link
          href="/"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600"
        >
          Volver
        </Link>
      </div>

      <section className="grid w-full max-w-2xl grid-cols-3 gap-3">
        <TarjetaTotal etiqueta="Hoy" {...totalesHoy} />
        <TarjetaTotal etiqueta="Semana" {...totalesSemana} />
        <TarjetaTotal etiqueta="Mes" {...totalesMes} />
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
        <ListaServicios
          servicios={servicios}
          onCambio={async () => {}}
        />
      </section>
    </main>
  );
}
