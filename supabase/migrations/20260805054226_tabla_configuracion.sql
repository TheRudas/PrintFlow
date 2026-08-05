create table if not exists public.configuracion (
  clave text primary key,
  valor text not null
);

alter table public.configuracion enable row level security;

create policy "Acceso anonimo a configuracion" on public.configuracion
  for all to anon
  using (true)
  with check (true);
