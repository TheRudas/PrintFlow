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
      <h1 className="gradiente-marca bg-clip-text text-3xl font-bold tracking-tight text-transparent">
        PrintFlow
      </h1>
      <p className="text-center text-texto-suave">
        Ingresa con tu cuenta para registrar ventas.
      </p>
      <FormularioIngreso />
    </main>
  );
}
