create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'empleado' check (rol in ('admin', 'empleado')),
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

drop policy if exists "Acceso anonimo a servicios" on public.servicios;
drop policy if exists "Acceso anonimo a registros" on public.registros;

create policy "Usuarios autenticados leen servicios" on public.servicios
  for select to authenticated
  using (true);

create policy "Admin gestiona servicios" on public.servicios
  for all to authenticated
  using (true)
  with check (true);

create policy "Usuarios autenticados leen registros" on public.registros
  for select to authenticated
  using (true);

create policy "Usuarios autenticados crean registros" on public.registros
  for insert to authenticated
  with check (true);

create policy "Perfiles visibles para autenticados" on public.perfiles
  for select to authenticated
  using (true);

create policy "Usuarios crean o actualizan su propio perfil" on public.perfiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin gestiona perfiles" on public.perfiles
  for all to authenticated
  using (true)
  with check (true);
