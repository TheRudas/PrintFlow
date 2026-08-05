import Link from "next/link";
import PantallaCobro from "@/components/cobro/PantallaCobro";
import { obtenerServiciosActivos } from "@/lib/repos/servicios";

export default async function Inicio(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const servicioId = searchParams.servicio;
  const servicios = await obtenerServiciosActivos();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <header className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          PrintFlow
        </h1>
        <Link
          href="/ayuda"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600"
        >
          Ayuda
        </Link>
      </header>

      <PantallaCobro
        servicios={servicios}
        servicioInicialId={typeof servicioId === "string" ? servicioId : null}
      />
    </main>
  );
}
