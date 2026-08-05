import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

function obtenerVariable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor;
}

export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    obtenerVariable("NEXT_PUBLIC_SUPABASE_URL"),
    obtenerVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaSetear) {
          try {
            cookiesParaSetear.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llama desde el Server Component; es seguro ignorar
            // cuando se invoca en acciones de servidor o proxy.
          }
        },
      },
    }
  );
}
