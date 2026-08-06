import Link from "next/link";
import BotonTema from "@/components/ui/BotonTema";

export default function PaginaAyuda() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="absolute right-4 top-4">
        <BotonTema />
      </div>
      <h1 className="text-2xl font-bold text-texto">Ayuda</h1>
      <p className="max-w-md text-texto-suave">
        Para registrar una venta, tocá el servicio que corresponde y elegí el
        precio. Si tenés un sticker NFC, apoyá el celular sobre él y la app
        hace el resto.
      </p>
      <Link
        href="/"
        className="btn-feedback glow-marca gradiente-marca rounded-full px-6 py-3 font-medium text-white"
      >
        Volver
      </Link>
    </main>
  );
}
