-- Idempotency store for order side effects (Inngest worker, Phase 2).
-- Each effect records its external reference here; steps check before acting, so
-- a retried order never produces a second invoice or AWB. (Per the P2 decision:
-- an app-schema mirror rather than Medusa order metadata — queryable + reliable.)
create table if not exists app.order_effects (
  order_id                    text primary key,
  pillar                      text,
  oblio_invoice_id            text,        -- set once the Oblio invoice exists
  oblio_skipped_reason        text,        -- e.g. 'no_credentials' (graceful degradation)
  anaf_status                 text,        -- 'sent' once transmitted to ANAF SPV
  anaf_skipped_reason         text,
  sameday_awb                 text,        -- set once the AWB exists
  sameday_skipped_reason      text,
  confirmation_email_sent_at  timestamptz, -- set once the confirmation email is sent
  confirmation_skipped_reason text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

drop trigger if exists order_effects_set_updated_at on app.order_effects;
create trigger order_effects_set_updated_at before update on app.order_effects
  for each row execute function app.set_updated_at();
