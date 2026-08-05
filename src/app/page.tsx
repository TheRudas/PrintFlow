import Link from "next/link";
import { redirect } from "next/navigation";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import { esAdmin, obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";
import CerrarSesion from "@/components/auth/CerrarSesion";

export default async function Inicio(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const servicioId = searchParams.servicio;
  const { usuarioId } = await obtenerUsuarioActual();

  if (!usuarioId) {
    redirect("/ingresar");
  }

  const [servicios, sesionAdmin] = await Promise.all([
    obtenerServiciosActivos(),
    esAdmin(),
  ]);

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
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600"
            >
              Panel
            </Link>
          )}
          <Link
            href="/ayuda"
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600"
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
