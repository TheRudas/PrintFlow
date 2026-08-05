create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  precio_por_defecto numeric,
  presets numeric[] not null default '{}',
  unidad text not null default 'hoja',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  servicio_id uuid not null references public.servicios (id) on delete restrict,
  cantidad integer not null default 1 check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario > 0),
  total numeric not null check (total >= 0),
  nota text,
  creado_en timestamptz not null default now()
);

create index if not exists idx_registros_servicio on public.registros (servicio_id);
create index if not exists idx_registros_fecha on public.registros (creado_en desc);

alter table public.servicios enable row level security;
alter table public.registros enable row level security;

create policy "Acceso anonimo a servicios" on public.servicios
  for all to anon
  using (true)
  with check (true);

create policy "Acceso anonimo a registros" on public.registros
  for all to anon
  using (true)
  with check (true);
