"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ingresarCodigoAdmin } from "@/lib/admin/acciones";

export default function EasterEggAyuda() {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function manejarEnvio(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    if (texto.trim() === "" || enviando) {
      return;
    }

    setEnviando(true);

    const resultado = await ingresarCodigoAdmin(texto.trim());

    if (resultado.exito) {
      router.push("/admin");
      router.refresh();
    } else {
      setTexto("");
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <input
        type="text"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Escribinos tu consulta o comentario"
        autoCapitalize="off"
        autoComplete="off"
        className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none"
      />
      <button
        type="submit"
        disabled={enviando}
        className="rounded-full bg-indigo-600 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
