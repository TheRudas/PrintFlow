require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { count: totalAntes } = await supabase.from("registros").select("*", { count: "exact", head: true });
  console.log(`Total antes de limpiar: ${totalAntes}`);

  const { count: recentes } = await supabase.from("registros").select("*", { count: "exact", head: true })
    .gte("creado_en", new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString())
    .eq("es_casa", false);
  console.log(`Registros de prueba (últimos 35 días): ${recentes}`);

  const { count: historicos } = await supabase.from("registros").select("*", { count: "exact", head: true })
    .gte("creado_en", "2026-01-01T00:00:00Z")
    .lt("creado_en", "2026-08-01T00:00:00Z")
    .eq("es_casa", false);
  console.log(`Registros de prueba (Ene-Jul 2026): ${historicos}`);

  console.log(`\nEliminando...`);

  const { error: e1 } = await supabase.from("registros").delete()
    .gte("creado_en", new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString())
    .eq("es_casa", false);
  if (e1) console.error("Error al eliminar recientes:", e1.message);

  const { error: e2 } = await supabase.from("registros").delete()
    .gte("creado_en", "2026-01-01T00:00:00Z")
    .lt("creado_en", "2026-08-01T00:00:00Z")
    .eq("es_casa", false);
  if (e2) console.error("Error al eliminar históricos:", e2.message);

  const { count: totalDespues } = await supabase.from("registros").select("*", { count: "exact", head: true });
  console.log(`\nTotal después de limpiar: ${totalDespues}`);
  console.log(`${totalAntes - totalDespues} registros de prueba eliminados.`);
}

main();
