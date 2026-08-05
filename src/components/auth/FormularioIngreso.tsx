"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { iniciarSesion } from "@/lib/auth/acciones";

export default function FormularioIngreso() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ingresando, setIngresando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("servicio");

  async function manejarEnvio(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setIngresando(true);
    setError(null);

    const resultado = await iniciarSesion(correo, contrasena);

    if (resultado.exito) {
      router.push(slug ? `/?servicio=${slug}` : "/");
      router.refresh();
    } else {
      setError(resultado.error ?? "No se pudo iniciar sesiÃ³n");
      setIngresando(false);
    }
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Correo
        <input
          type="email"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          autoComplete="email"
          required
          className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        ContraseÃ±a
        <input
          type="password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          autoComplete="current-password"
          required
          className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-marca-500 focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={ingresando}
        className="btn-feedback mt-1 rounded-full gradiente-marca py-3 font-medium text-white disabled:opacity-50"
      >
        {ingresando ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

