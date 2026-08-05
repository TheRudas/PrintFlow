insert into public.servicios (slug, nombre, precio_por_defecto, presets, unidad, activo) values
  ('impresion-bn', 'Impresión B/N', 300, array[300, 700, 1000, 1200], 'hoja', true),
  ('impresion-color', 'Impresión Color', 700, array[700, 1000, 1200, 1500], 'hoja', true),
  ('fotocopia-bn', 'Fotocopia B/N', 100, array[100, 200, 300], 'hoja', true),
  ('fotocopia-color', 'Fotocopia Color', 300, array[300, 500, 700], 'hoja', true)
on conflict (slug) do nothing;
