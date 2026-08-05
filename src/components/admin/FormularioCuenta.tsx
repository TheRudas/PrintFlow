"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCuentaEmpleado } from "@/lib/auth/acciones";

export default function FormularioCuenta() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function manejarEnvio(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setGuardando(true);
    setError(null);

    const resultado = await crearCuentaEmpleado(correo, contrasena, nombre);

    if (resultado.exito) {
      setNombre("");
      setCorreo("");
      setContrasena("");
      router.refresh();
    } else {
      setError(resultado.error ?? "No se pudo crear la cuenta");
    }

    setGuardando(false);
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
    >
      <h2 className="font-semibold text-zinc-900">Nueva cuenta de empleado</h2>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          required
          placeholder="Ej: Mamá, Papá"
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-indigo-600 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Correo
        <input
          type="email"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          required
          placeholder="mama@correo.com"
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-indigo-600 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Contraseña
        <input
          type="password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          required
          minLength={6}
          className="rounded-xl border-2 border-zinc-200 px-3 py-2 text-zinc-900 focus:border-indigo-600 focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded-full bg-emerald-500 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
      >
        {guardando ? "Creando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
