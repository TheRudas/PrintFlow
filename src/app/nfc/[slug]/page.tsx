import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth/acciones";
import { obtenerServicioPorSlug } from "@/lib/repos/servicios";

export const dynamic = "force-dynamic";

export default async function PaginaNfc({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { usuarioId } = await obtenerUsuarioActual();

  if (!usuarioId) {
    redirect(`/ingresar?servicio=${slug}`);
  }

  const servicio = await obtenerServicioPorSlug(slug);

  if (servicio) {
    redirect(`/?servicio=${servicio.id}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">
        Este servicio ya no está disponible
      </h1>
      <p className="text-zinc-600">
        El sticker que escaneaste no corresponde a un servicio activo.
      </p>
      <Link
        href="/"
        className="btn-feedback rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Elegir otro servicio
      </Link>
    </main>
  );
}
