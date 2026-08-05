"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesionAdmin } from "@/lib/admin/acciones";

export default function CerrarSesionAdmin() {
  const [cerrando, setCerrando] = useState(false);
  const router = useRouter();

  async function cerrarSesion(): Promise<void> {
    setCerrando(true);
    await cerrarSesionAdmin();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cerrando}
      className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {cerrando ? "Cerrando..." : "Cerrar sesión admin"}
    </button>
  );
}
