import { redirect } from "next/navigation";
import FormularioIngreso from "@/components/auth/FormularioIngreso";
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
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        PrintFlow
      </h1>
      <p className="text-center text-zinc-600">
        Ingresá con tu cuenta para registrar ventas.
      </p>
      <FormularioIngreso />
    </main>
  );
}
