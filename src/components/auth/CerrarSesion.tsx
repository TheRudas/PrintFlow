"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth/acciones";

export default function CerrarSesion() {
  const [cerrando, setCerrando] = useState(false);
  const router = useRouter();

  async function cerrar(): Promise<void> {
    setCerrando(true);
    await cerrarSesion();
    router.push("/ingresar");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cerrar}
      disabled={cerrando}
      className="btn-feedback rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
    >
      {cerrando ? "Saliendo..." : "Salir"}
    </button>
  );
}
