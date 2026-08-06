import Link from "next/link";
import { redirect } from "next/navigation";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import UltimasVentas from "@/components/historial/UltimasVentas";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";
import { obtenerUltimasVentas } from "@/lib/repos/estadisticas";
import CerrarSesion from "@/components/auth/CerrarSesion";
import BotonTema from "@/components/ui/BotonTema";

const CANTIDAD_ULTIMAS_VENTAS = 6;

export default async function Inicio(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const servicioId = searchParams.servicio;
  const { usuarioId, perfil } = await obtenerUsuarioActual();

  if (!usuarioId) {
    redirect("/ingresar");
  }

  const sesionAdmin = perfil?.rol === "admin";
  const [servicios, ultimasVentas] = await Promise.all([
    obtenerServiciosActivos(),
    sesionAdmin ? obtenerUltimasVentas(CANTIDAD_ULTIMAS_VENTAS) : [],
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 py-8">
      <header className="flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="gradiente-marca sombra-marca flex h-10 w-10 items-center justify-center rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M6 18V6" />
              <path d="m6 6-3 3" />
              <path d="m6 6 3 3" />
              <path d="M18 18V6" />
              <path d="m18 6-3 3" />
              <path d="m18 6 3 3" />
              <path d="M6 12h12" />
            </svg>
          </div>
          <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            PrintFlow
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <BotonTema />
          {sesionAdmin && (
            <Link
              href="/admin"
              className="btn-feedback rounded-full border border-marca-200 bg-superficie px-4 py-2 text-sm font-medium text-marca-700 hover:bg-marca-50 dark:text-marca-300"
            >
              Panel
            </Link>
          )}
          <CerrarSesion />
        </div>
      </header>

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
