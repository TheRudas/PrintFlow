import { redirect } from "next/navigation";
import Link from "next/link";
import MenuUsuario from "@/components/ui/MenuUsuario";
import SincronizarTiempoReal from "@/components/ui/SincronizarTiempoReal";
import RefrescarEnMedianoche from "@/components/ui/RefrescarEnMedianoche";
import HistorialCompleto from "@/components/historial/HistorialCompleto";
import { esAdmin, obtenerUsuarioActual } from "@/lib/auth/acciones";
import { nombreUsuario } from "@/lib/formatear";
import { obtenerHistorialFiltrado } from "@/lib/repos/estadisticas";
import { obtenerTodosLosServicios } from "@/lib/repos/servicios";

export const dynamic = "force-dynamic";

export default async function PaginaHistorial() {
  const sesionValida = await esAdmin();
  if (!sesionValida) {
    redirect("/");
  }

  const { perfil, correo } = await obtenerUsuarioActual();
  const nombreMostrado = nombreUsuario(correo, perfil?.nombre);

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
        <div className="flex gap-1.5">
          {nombreMostrado && (
            <span className="max-w-[6rem] truncate rounded-full border border-borde bg-superficie px-2 py-1 text-xs font-semibold text-texto-suave">
              {nombreMostrado}
            </span>
          )}
          <MenuUsuario />
          <Link
            href="/"
            className="btn-feedback rounded-full border border-marca-200 bg-superficie px-3 py-1.5 text-xs font-medium text-marca-700 hover:bg-marca-50 dark:text-marca-300"
          >
            Volver
          </Link>
        </div>
      </div>

      <HistorialCompleto
        historialInicial={historial}
        servicios={servicios}
      />
      <RefrescarEnMedianoche />
      <SincronizarTiempoReal />
    </main>
  );
}
