import Link from "next/link";
import { redirect } from "next/navigation";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";
import CerrarSesion from "@/components/auth/CerrarSesion";

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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          PrintFlow
        </h1>
        <div className="flex gap-2">
          {sesionAdmin && (
            <Link
              href="/admin"
              className="btn-feedback rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Panel
            </Link>
          )}
          <Link
            href="/ayuda"
            className="btn-feedback rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Ayuda
          </Link>
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
