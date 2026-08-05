"use client";

import { useState } from "react";
import { cambiarContrasena } from "@/lib/auth/acciones";
import type { Perfil } from "@/lib/types";
import FormularioCuenta from "./FormularioCuenta";

interface Props {
  perfiles: Perfil[];
}

export default function GestionCuentas({ perfiles }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function manejarCambiarContrasena(
    usuarioId: string
  ): Promise<void> {
    const nuevaContrasena = prompt(
      "Nueva contraseña (mínimo 6 caracteres):"
    );
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      return;
    }

    const resultado = await cambiarContrasena(usuarioId, nuevaContrasena);
    if (!resultado.exito) {
      alert(resultado.error ?? "No se pudo cambiar la contraseña");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-marca-500">Cuentas</h2>
        <button
          type="button"
          onClick={() => setMostrarFormulario((mostrar) => !mostrar)}
          className="btn-feedback rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          {mostrarFormulario ? "Ocultar" : "+ Nueva cuenta"}
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioCuenta />
      )}

      <div className="flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
        {perfiles.map((perfil) => (
          <div
            key={perfil.id}
            className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-texto">
                {perfil.nombre || "Sin nombre"}
              </p>
              <p className="truncate text-xs text-texto-suave">
                {perfil.rol === "admin" ? "Administrador" : "Empleado"}
              </p>
            </div>
            {perfil.rol !== "admin" && (
              <button
                type="button"
                onClick={() => manejarCambiarContrasena(perfil.id)}
                className="btn-feedback shrink-0 rounded-full border border-marca-200 px-3 py-1.5 text-sm font-medium text-marca-700 hover:bg-marca-50"
              >
                Cambiar contraseña
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
