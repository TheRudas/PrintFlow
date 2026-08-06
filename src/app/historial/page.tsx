import { redirect } from "next/navigation";
import Link from "next/link";
import CerrarSesion from "@/components/auth/CerrarSesion";
import BotonTema from "@/components/ui/BotonTema";
import HistorialCompleto from "@/components/historial/HistorialCompleto";
import { esAdmin } from "@/lib/auth/acciones";
import { obtenerHistorialFiltrado } from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";

export const dynamic = "force-dynamic";

export default async function PaginaHistorial() {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const [historial, servicios] = await Promise.all([
    obtenerHistorialFiltrado(0, { tipo: "todas", modalidad: "todas" }, 200),
    obtenerTodosLosServicios(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="gradiente-marca bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Historial completo
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

      <HistorialCompleto
        historialInicial={historial}
        servicios={servicios}
      />
    </main>
  );
}
