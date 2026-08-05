import Link from "next/link";
import EasterEggAyuda from "@/components/admin/EasterEggAyuda";

export default function PaginaAyuda() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Ayuda</h1>
      <p className="max-w-md text-zinc-600">
        Para registrar una venta, tocá el servicio que corresponde y elegí el
        precio. Si tenés un sticker NFC, apoyá el celular sobre él y la app
        hace el resto.
      </p>
      <EasterEggAyuda />
      <Link
        href="/"
        className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white"
      >
        Volver
      </Link>
    </main>
  );
}
