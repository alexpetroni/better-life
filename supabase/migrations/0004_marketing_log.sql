-- Phase 3 (P3-2): orchestration support. A log of marketing emails actually sent
-- by the worker's Inngest sequences (nurture, cart recovery, post-purchase,
-- re-engagement). Gives us (a) send idempotency across event re-triggers and
-- (b) the "no recent sequence" signal the daily re-engagement cron needs.
-- Transactional mail (P2-4 order effects) is NOT logged here — it lives in
-- app.order_effects and bypasses the marketing-consent gate.

create table if not exists app.marketing_emails (
  id        uuid primary key default gen_random_uuid(),
  lead_id   uuid not null references app.leads (id) on delete cascade,
  kind      text not null,                 -- nurture_tip | nurture_product | cart_recovery_1 | ...
  sent_at   timestamptz not null default now()
);
create index if not exists marketing_emails_lead_idx on app.marketing_emails (lead_id);
create index if not exists marketing_emails_sent_idx on app.marketing_emails (lead_id, sent_at);
