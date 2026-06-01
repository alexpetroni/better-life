-- A dedicated login role for Medusa whose default search_path isolates it in the
-- `medusa` schema. This is enforced server-side on EVERY connection Medusa opens
-- (main + per-module), which `databaseSchema` alone does not guarantee. Combined
-- with projectConfig.databaseSchema, all Medusa tables land in `medusa`.
--
-- Dev password below is for local docker. In production, set the password
-- out-of-band (e.g. ALTER ROLE medusa_app PASSWORD ...) and point
-- MEDUSA_DATABASE_URL at it; this block is idempotent and won't clobber it.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'medusa_app') then
    create role medusa_app login password 'medusa_app';
  end if;
end $$;

grant all on schema medusa to medusa_app;
grant usage on schema public to medusa_app;  -- access to built-ins / extensions
alter role medusa_app set search_path = medusa, public;
