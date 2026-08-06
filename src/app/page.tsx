import Link from "next/link";
import { redirect } from "next/navigation";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";
import CerrarSesion from "@/components/auth/CerrarSesion";
import BotonTema from "@/components/ui/BotonTema";

export default async function Inicio(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const servicioId = searchParams.servicio;
  const { usuarioId, perfil } = await obtenerUsuarioActual();

  if (!usuarioId) {
    redirect("/ingresar");
  }

  const sesionAdmin = perfil?.rol === "admin";
  const servicios = await obtenerServiciosActivos();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <header className="flex w-full max-w-md items-center justify-between">
        <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          PrintFlow
        </h1>
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
    </main>
  );
}
