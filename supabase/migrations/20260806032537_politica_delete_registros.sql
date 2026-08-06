create policy "Usuarios autenticados eliminan registros" on public.registros
  for delete to authenticated
  using (true);
