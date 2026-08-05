import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function obtenerVariable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export function crearClienteAdmin() {
  return createClient<Database>(
    obtenerVariable("NEXT_PUBLIC_SUPABASE_URL"),
    obtenerVariable("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
