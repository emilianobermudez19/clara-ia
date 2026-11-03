-- Chía: cuentas con bóveda cifrada de extremo a extremo.
-- El servidor solo guarda datos opacos: no puede leer fichas, vacunas, recordatorios ni consultas.

create table if not exists public.vaults (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  wrapped_key           jsonb not null,           -- clave de datos envuelta con la clave derivada de la contraseña
  recovery_wrapped_key  jsonb not null,           -- clave de datos envuelta con la clave de recuperación
  data                  jsonb not null,           -- ficha completa cifrada (AES-256-GCM)
  kdf_iterations        integer not null default 600000 check (kdf_iterations >= 100000),
  revision              bigint not null default 1, -- para detectar cambios desde otro dispositivo
  updated_at            timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  -- Tamaño máximo razonable (≈1 MB) para evitar abuso del almacenamiento.
  constraint vaults_data_size check (pg_column_size(data) < 1048576)
);

comment on table public.vaults is 'Bóvedas cifradas de extremo a extremo. Contenido ilegible para el servidor.';

-- Cada escritura sube la revisión y la fecha automáticamente.
create or replace function public.vaults_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.revision := coalesce(old.revision, 0) + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists vaults_touch on public.vaults;
create trigger vaults_touch before update on public.vaults
for each row execute function public.vaults_touch();

-- Seguridad a nivel de fila: cada persona ve y cambia SOLO su propia bóveda.
alter table public.vaults enable row level security;

drop policy if exists "vaults: leer la propia" on public.vaults;
create policy "vaults: leer la propia" on public.vaults
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "vaults: crear la propia" on public.vaults;
create policy "vaults: crear la propia" on public.vaults
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "vaults: actualizar la propia" on public.vaults;
create policy "vaults: actualizar la propia" on public.vaults
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "vaults: borrar la propia" on public.vaults;
create policy "vaults: borrar la propia" on public.vaults
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Sin acceso para visitantes anónimos.
revoke all on public.vaults from anon;
grant select, insert, update, delete on public.vaults to authenticated;

-- Borrar la cuenta completa (bóveda + usuario) desde la app. Solo afecta a quien la llama.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
