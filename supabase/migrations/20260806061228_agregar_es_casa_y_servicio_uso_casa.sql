alter table public.registros add column if not exists es_casa boolean not null default false;

insert into public.servicios (slug, nombre, precio_por_defecto, presets, unidad, activo) values
  ('uso-casa', 'USO DE LA CASA', null, '{}', 'hoja', true)
on conflict (slug) do nothing;
