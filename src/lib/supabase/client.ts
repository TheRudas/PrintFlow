import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

function obtenerVariable(nombre: string): string {
  const variables: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const valor = variables[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export function crearClienteSupabase() {
  return createBrowserClient<Database>(
    obtenerVariable("NEXT_PUBLIC_SUPABASE_URL"),
    obtenerVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
