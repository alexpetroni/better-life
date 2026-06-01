-- Isolated schema for Medusa (commerce). Medusa connects with its search_path set
-- to this schema so all its native tables live here, separate from `app` and
-- `payload`. Medusa's own migrations create the tables; this only reserves the schema.
create schema if not exists medusa;
