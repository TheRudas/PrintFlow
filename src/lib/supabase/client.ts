import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function obtenerVariable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export function crearClienteSupabase() {
  return createClient<Database>(
    obtenerVariable("NEXT_PUBLIC_SUPABASE_URL"),
    obtenerVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
