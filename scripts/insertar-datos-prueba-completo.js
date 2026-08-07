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

function fechaEnMes(mes, dia, hora = 10) {
  const año = new Date().getFullYear();
  const d = new Date(año, mes, dia, hora, 0, 0, 0);
  return d.toISOString();
}

const registros = [
  // Enero
  { mes: 0, dia: 5, slug: "impresion-bn", precio: 400, cantidad: 3 },
  { mes: 0, dia: 12, slug: "fotocopia-color", precio: 500, cantidad: 2 },
  { mes: 0, dia: 20, slug: "impresion-color", precio: 700, cantidad: 1 },
  
  // Febrero
  { mes: 1, dia: 3, slug: "fotocopia-bn", precio: 200, cantidad: 10 },
  { mes: 1, dia: 15, slug: "impresion-bn", precio: 500, cantidad: 5 },
  { mes: 1, dia: 28, slug: "impresion-color", precio: 800, cantidad: 2 },
  
  // Marzo
  { mes: 2, dia: 8, slug: "fotocopia-color", precio: 600, cantidad: 3 },
  { mes: 2, dia: 18, slug: "impresion-bn", precio: 400, cantidad: 8 },
  { mes: 2, dia: 25, slug: "fotocopia-bn", precio: 200, cantidad: 15 },
  
  // Abril
  { mes: 3, dia: 2, slug: "impresion-color", precio: 1000, cantidad: 1 },
  { mes: 3, dia: 14, slug: "fotocopia-bn", precio: 400, cantidad: 1 },
  { mes: 3, dia: 22, slug: "impresion-bn", precio: 500, cantidad: 3 },
  
  // Mayo
  { mes: 4, dia: 6, slug: "fotocopia-color", precio: 400, cantidad: 3 },
  { mes: 4, dia: 16, slug: "impresion-color", precio: 700, cantidad: 4 },
  { mes: 4, dia: 28, slug: "impresion-bn", precio: 400, cantidad: 5 },
  
  // Junio
  { mes: 5, dia: 4, slug: "fotocopia-bn", precio: 200, cantidad: 4 },
  { mes: 5, dia: 15, slug: "impresion-color", precio: 800, cantidad: 2 },
  { mes: 5, dia: 25, slug: "fotocopia-color", precio: 500, cantidad: 2 },
  
  // Julio
  { mes: 6, dia: 7, slug: "impresion-bn", precio: 400, cantidad: 3 },
  { mes: 6, dia: 14, slug: "impresion-color", precio: 700, cantidad: 1 },
  { mes: 6, dia: 21, slug: "fotocopia-bn", precio: 200, cantidad: 5 },
  { mes: 6, dia: 28, slug: "fotocopia-color", precio: 400, cantidad: 2 },
  
  // Agosto (mes actual) - distribuido en 4 semanas
  { mes: 7, dia: 1, slug: "impresion-bn", precio: 400, cantidad: 3 },
  { mes: 7, dia: 1, slug: "impresion-color", precio: 700, cantidad: 1 },
  { mes: 7, dia: 1, slug: "fotocopia-bn", precio: 200, cantidad: 5 },
  
  { mes: 7, dia: 8, slug: "impresion-bn", precio: 500, cantidad: 2 },
  { mes: 7, dia: 8, slug: "fotocopia-color", precio: 400, cantidad: 2 },
  { mes: 7, dia: 8, slug: "impresion-color", precio: 800, cantidad: 1 },
  
  { mes: 7, dia: 15, slug: "fotocopia-bn", precio: 200, cantidad: 10 },
  { mes: 7, dia: 15, slug: "impresion-bn", precio: 600, cantidad: 1 },
  { mes: 7, dia: 15, slug: "impresion-color", precio: 1000, cantidad: 2 },
  
  { mes: 7, dia: 22, slug: "fotocopia-bn", precio: 400, cantidad: 3 },
  { mes: 7, dia: 22, slug: "fotocopia-color", precio: 500, cantidad: 1 },
  { mes: 7, dia: 22, slug: "impresion-bn", precio: 400, cantidad: 4 },
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
      creado_en: fechaEnMes(r.mes, r.dia),
      es_casa: false,
    });

    if (error) {
      console.error(`Error al insertar: ${error.message}`);
    } else {
      console.log(`✓ Insertado: ${r.slug} x${r.cantidad} a $${r.precio} (${r.mes + 1}/${r.dia})`);
    }
  }

  console.log(`\n${registros.length} registros insertados cubriendo todo el año.`);
}

main();
