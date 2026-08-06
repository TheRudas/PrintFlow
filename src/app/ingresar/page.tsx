import { redirect } from "next/navigation";
import FormularioIngreso from "@/components/auth/FormularioIngreso";
import BotonTema from "@/components/ui/BotonTema";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";

export default async function PaginaIngresar(props: PageProps<"/ingresar">) {
  const searchParams = await props.searchParams;
  const { usuarioId } = await obtenerUsuarioActual();

  if (usuarioId) {
    const slug = searchParams.servicio;
    redirect(typeof slug === "string" ? `/?servicio=${slug}` : "/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="absolute right-4 top-4">
        <BotonTema />
      </div>
      <div className="animar-entrada flex flex-col items-center gap-5">
        <div className="gradiente-marca sombra-marca flex h-16 w-16 items-center justify-center rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
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
        <h1 className="gradiente-marca bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          PrintFlow
        </h1>
        <p className="text-center text-texto-suave">
          Ingresa con tu cuenta para registrar ventas.
        </p>
      </div>
      <FormularioIngreso />
    </main>
  );
}
