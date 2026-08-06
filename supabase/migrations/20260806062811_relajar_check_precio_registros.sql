alter table public.registros drop constraint if exists registros_precio_unitario_check;
alter table public.registros add constraint registros_precio_unitario_check check (precio_unitario >= 0);
