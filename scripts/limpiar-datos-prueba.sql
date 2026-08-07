-- ============================================================
-- Limpiar los registros de prueba insertados
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

DELETE FROM public.registros
WHERE creado_en >= now() - interval '31 days'
  AND creado_en <= now();
