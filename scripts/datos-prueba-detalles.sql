-- ============================================================
-- Insertar 30 registros de prueba para visualizar gráficas
-- Ejecutar en SQL Editor de Supabase
-- Para limpiar: ejecutar scripts/limpiar-datos-prueba.sql
-- ============================================================

DO $$
DECLARE
  svc_imp_bn uuid;
  svc_imp_cl uuid;
  svc_fot_bn uuid;
  svc_fot_cl uuid;
  admin_id uuid;
  i int;
  r record;
BEGIN
  SELECT id INTO svc_imp_bn FROM public.servicios WHERE slug = 'impresion-bn';
  SELECT id INTO svc_imp_cl FROM public.servicios WHERE slug = 'impresion-color';
  SELECT id INTO svc_fot_bn FROM public.servicios WHERE slug = 'fotocopia-bn';
  SELECT id INTO svc_fot_cl FROM public.servicios WHERE slug = 'fotocopia-color';
  SELECT id INTO admin_id FROM public.perfiles WHERE rol = 'admin' LIMIT 1;

  -- Crear tabla temporal con la combinacion de registros
  CREATE TEMP TABLE IF NOT EXISTS _prueba_detalles (
    fecha timestamptz,
    slug text,
    precio int,
    cantidad int
  );

  -- Limpiar si existia
  DELETE FROM _prueba_detalles;

  -- 30 registros variados en los ultimos 30 dias
  INSERT INTO _prueba_detalles (fecha, slug, precio, cantidad) VALUES
    (now() - interval '0 days'  + interval '7 hours',   'impresion-bn',    400, 3),
    (now() - interval '0 days'  + interval '9 hours',   'impresion-color', 700, 1),
    (now() - interval '0 days'  + interval '11 hours',  'fotocopia-bn',    200, 5),
    (now() - interval '1 day'   + interval '8 hours',   'impresion-bn',    500, 2),
    (now() - interval '1 day'   + interval '10 hours',  'fotocopia-color', 400, 2),
    (now() - interval '1 day'   + interval '14 hours',  'impresion-color', 800, 1),
    (now() - interval '2 days'  + interval '9 hours',   'fotocopia-bn',    200, 10),
    (now() - interval '2 days'  + interval '15 hours',  'impresion-bn',    600, 1),
    (now() - interval '3 days'  + interval '8 hours',   'impresion-color', 1000, 2),
    (now() - interval '3 days'  + interval '11 hours',  'fotocopia-bn',    400, 3),
    (now() - interval '3 days'  + interval '14 hours',  'fotocopia-color', 500, 1),
    (now() - interval '4 days'  + interval '9 hours',   'impresion-bn',    400, 4),
    (now() - interval '5 days'  + interval '10 hours',  'impresion-color', 700, 3),
    (now() - interval '5 days'  + interval '13 hours',  'fotocopia-bn',    200, 6),
    (now() - interval '6 days'  + interval '8 hours',   'impresion-bn',    500, 1),
    (now() - interval '6 days'  + interval '15 hours',  'impresion-color', 800, 2),
    (now() - interval '7 days'  + interval '9 hours',   'fotocopia-color', 600, 1),
    (now() - interval '8 days'  + interval '10 hours',  'impresion-bn',    400, 8),
    (now() - interval '9 days'  + interval '11 hours',  'impresion-color', 1000, 1),
    (now() - interval '10 days' + interval '8 hours',   'fotocopia-bn',    200, 15),
    (now() - interval '10 days' + interval '14 hours',  'impresion-bn',    600, 2),
    (now() - interval '12 days' + interval '9 hours',   'fotocopia-color', 400, 3),
    (now() - interval '14 days' + interval '10 hours',  'impresion-color', 700, 4),
    (now() - interval '15 days' + interval '13 hours',  'fotocopia-bn',    400, 1),
    (now() - interval '17 days' + interval '8 hours',   'impresion-bn',    500, 3),
    (now() - interval('19 days') + interval '11 hours',  'impresion-color', 800, 2),
    (now() - interval '22 days' + interval '14 hours',  'fotocopia-bn',    200, 4),
    (now() - interval '25 days' + interval '9 hours',   'impresion-bn',    400, 5),
    (now() - interval '28 days' + interval '10 hours',  'fotocopia-color', 500, 2),
    (now() - interval '29 days' + interval '12 hours',  'impresion-color', 1000, 1);

  -- Insertar los registros reales
  FOR r IN SELECT * FROM _prueba_detalles LOOP
    CASE r.slug
      WHEN 'impresion-bn'    THEN i := svc_imp_bn;
      WHEN 'impresion-color' THEN i := svc_imp_cl;
      WHEN 'fotocopia-bn'    THEN i := svc_fot_bn;
      WHEN 'fotocopia-color' THEN i := svc_fot_cl;
    END CASE;

    INSERT INTO public.registros
      (servicio_id, cantidad, precio_unitario, total, creado_en, es_casa)
    VALUES
      (i, r.cantidad, r.precio, r.precio * r.cantidad, r.fecha, false);
  END LOOP;

  DROP TABLE IF EXISTS _prueba_detalles;
END $$;
