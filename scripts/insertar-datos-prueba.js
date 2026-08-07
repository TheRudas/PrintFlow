require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(7 + (n % 10), (n * 7) % 60, 0, 0);
  return d.toISOString();
}

const registros = [
  { dias: 0, slug: "impresion-bn", precio: 400, cantidad: 3 },
  { dias: 0, slug: "impresion-color", precio: 700, cantidad: 1 },
  { dias: 0, slug: "fotocopia-bn", precio: 200, cantidad: 5 },
  { dias: 1, slug: "impresion-bn", precio: 500, cantidad: 2 },
  { dias: 1, slug: "fotocopia-color", precio: 400, cantidad: 2 },
  { dias: 1, slug: "impresion-color", precio: 800, cantidad: 1 },
  { dias: 2, slug: "fotocopia-bn", precio: 200, cantidad: 10 },
  { dias: 2, slug: "impresion-bn", precio: 600, cantidad: 1 },
  { dias: 3, slug: "impresion-color", precio: 1000, cantidad: 2 },
  { dias: 3, slug: "fotocopia-bn", precio: 400, cantidad: 3 },
  { dias: 3, slug: "fotocopia-color", precio: 500, cantidad: 1 },
  { dias: 4, slug: "impresion-bn", precio: 400, cantidad: 4 },
  { dias: 5, slug: "impresion-color", precio: 700, cantidad: 3 },
  { dias: 5, slug: "fotocopia-bn", precio: 200, cantidad: 6 },
  { dias: 6, slug: "impresion-bn", precio: 500, cantidad: 1 },
  { dias: 6, slug: "impresion-color", precio: 800, cantidad: 2 },
  { dias: 7, slug: "fotocopia-color", precio: 600, cantidad: 1 },
  { dias: 8, slug: "impresion-bn", precio: 400, cantidad: 8 },
  { dias: 9, slug: "impresion-color", precio: 1000, cantidad: 1 },
  { dias: 10, slug: "fotocopia-bn", precio: 200, cantidad: 15 },
  { dias: 10, slug: "impresion-bn", precio: 600, cantidad: 2 },
  { dias: 12, slug: "fotocopia-color", precio: 400, cantidad: 3 },
  { dias: 14, slug: "impresion-color", precio: 700, cantidad: 4 },
  { dias: 15, slug: "fotocopia-bn", precio: 400, cantidad: 1 },
  { dias: 17, slug: "impresion-bn", precio: 500, cantidad: 3 },
  { dias: 19, slug: "impresion-color", precio: 800, cantidad: 2 },
  { dias: 22, slug: "fotocopia-bn", precio: 200, cantidad: 4 },
  { dias: 25, slug: "impresion-bn", precio: 400, cantidad: 5 },
  { dias: 28, slug: "fotocopia-color", precio: 500, cantidad: 2 },
  { dias: 29, slug: "impresion-color", precio: 1000, cantidad: 1 },
];

async function main() {
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, slug");

  const mapa = {};
  for (const s of servicios) mapa[s.slug] = s.id;

  for (const r of registros) {
    const servicioId = mapa[r.slug];
    if (!servicioId) {
      console.error(`Servicio no encontrado: ${r.slug}`);
      continue;
    }

    const { error } = await supabase.from("registros").insert({
      servicio_id: servicioId,
      cantidad: r.cantidad,
      precio_unitario: r.precio,
      total: r.precio * r.cantidad,
      creado_en: diasAtras(r.dias),
      es_casa: false,
    });

    if (error) {
      console.error(`Error al insertar día -${r.dias}: ${error.message}`);
    } else {
      console.log(`✓ Insertado: ${r.slug} x${r.cantidad} a $${r.precio} (día -${r.dias})`);
    }
  }

  console.log(`\n${registros.length} registros insertados. Los datos ya están en la DB.`);
}

main();
