import Link from "next/link";
import { redirect } from "next/navigation";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import UltimasVentas from "@/components/historial/UltimasVentas";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";
import { obtenerUltimasVentas, obtenerTotalesDeHoy } from "@/lib/repos/estadisticas";
import { formatearMoneda, nombreUsuario } from "@/lib/formatear";
import MenuUsuario from "@/components/ui/MenuUsuario";

const CANTIDAD_ULTIMAS_VENTAS = 6;

export const dynamic = "force-dynamic";

export default async function Inicio(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const servicioId = searchParams.servicio;
  const { usuarioId, correo, perfil } = await obtenerUsuarioActual();

  if (!usuarioId) {
    redirect("/ingresar");
  }

  const sesionAdmin = perfil?.rol === "admin";
  const nombreMostrado = nombreUsuario(correo, perfil?.nombre);
  const [servicios, ultimasVentas, totalesHoy] = await Promise.all([
    obtenerServiciosActivos(),
    sesionAdmin ? obtenerUltimasVentas(CANTIDAD_ULTIMAS_VENTAS) : [],
    obtenerTotalesDeHoy(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          PrintFlow
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {sesionAdmin && (
            <Link
              href="/admin"
              className="btn-feedback rounded-full border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 dark:text-marca-300"
            >
              Panel
            </Link>
          )}
          {nombreMostrado && (
            <span className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm font-semibold text-texto-suave">
              {nombreMostrado}
            </span>
          )}
          <MenuUsuario />
        </div>
      </header>

      {totalesHoy.montoTotal > 0 && (
        <div className="sombra-suave flex w-full max-w-md items-center justify-between rounded-2xl border border-borde bg-superficie px-4 py-3">
          <span className="text-sm font-medium text-texto-suave">
            Total de hoy
          </span>
          <span className="text-lg font-bold tabular-nums text-texto">
            {formatearMoneda(totalesHoy.montoTotal)}
          </span>
        </div>
      )}

      <PantallaCobro
        servicios={servicios}
        servicioInicialId={typeof servicioId === "string" ? servicioId : null}
      />

      {sesionAdmin && (
        <UltimasVentas registros={ultimasVentas} servicios={servicios} />
      )}
    </main>
  );
}
