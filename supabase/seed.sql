insert into public.servicios (slug, nombre, precio_por_defecto, presets, unidad, activo) values
  ('impresion-bn', 'Impresión B/N', 400, array[400, 500, 600], 'hoja', true),
  ('impresion-color', 'Impresión Color', 700, array[700, 800, 1000], 'hoja', true),
  ('fotocopia-bn', 'Fotocopia B/N', 200, array[200, 400], 'hoja', true),
  ('fotocopia-color', 'Fotocopia Color', 400, array[400, 500, 600], 'hoja', true)
on conflict (slug) do nothing;
