-- ─────────────────────────────────────────────────────────────────────────────
-- App schema: lead identity, quiz responses (sensitive), granular consent.
--
-- Principles (CLAUDE.md):
--   • Keyed by UUID, never email. Email is optional and never an identity join.
--   • Quiz answers are sensitive (health-adjacent) regardless of wellness framing.
--   • Right to erasure: deleting a lead cascades to quiz responses + consent.
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists app;
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ── leads ──────────────────────────────────────────────────────────────────--
-- Created lazily (quiz submit, newsletter, or — Phase 2 — purchase). Never for
-- anonymous traffic.
create table if not exists app.leads (
  id                  uuid primary key default gen_random_uuid(),
  email               text,                                      -- OPTIONAL; only after consented capture. Never a key/join.
  email_verified_at   timestamptz,
  claim_token         uuid not null default gen_random_uuid(),   -- embedded in the post-quiz email link
  claim_token_used_at timestamptz,                               -- single-use marker (consumed in Phase 2)
  behavioral_tags     text[] not null default '{}',
  first_touch_utm     jsonb,                                     -- {source, medium, campaign, term, content}
  medusa_customer_id  text,                                      -- nullable now; linked at first purchase (Phase 2)
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Email is optional and NOT a key, but when present it should be unique
-- (case-insensitive) so Phase 2 claiming/merge has a clean anchor.
create unique index if not exists leads_email_unique
  on app.leads (lower(email)) where email is not null;
create unique index if not exists leads_claim_token_unique on app.leads (claim_token);

-- ── quiz_responses (SENSITIVE) ───────────────────────────────────────────────
create table if not exists app.quiz_responses (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references app.leads (id) on delete cascade,
  quiz_slug    text not null,
  pillar_slug  text not null,                                    -- tagged by pillar
  answers      jsonb not null,                                   -- {question_key: value} — sensitive
  profile_key  text,                                             -- computed result profile
  submitted_at timestamptz not null default now()
);
create index if not exists quiz_responses_lead_idx on app.quiz_responses (lead_id);
create index if not exists quiz_responses_pillar_idx on app.quiz_responses (pillar_slug);

-- ── consent_records ──────────────────────────────────────────────────────────
-- One row per purpose. Separate, unticked opt-ins → e.g. a 'results_delivery'
-- row and a 'marketing' row. Stores the EXACT text shown and its version.
create table if not exists app.consent_records (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references app.leads (id) on delete cascade,
  purpose         text not null,                                 -- 'results_delivery' | 'marketing'
  granted         boolean not null,
  consent_text    text not null,                                 -- exact text shown at capture
  consent_version text not null,
  locale          text not null,
  created_at      timestamptz not null default now()
);
create index if not exists consent_records_lead_idx on app.consent_records (lead_id);
create index if not exists consent_records_purpose_idx on app.consent_records (purpose);

-- ── updated_at trigger ───────────────────────────────────────────────────────
create or replace function app.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on app.leads;
create trigger leads_set_updated_at before update on app.leads
  for each row execute function app.set_updated_at();

-- ── Right to erasure ─────────────────────────────────────────────────────────
-- Deletes a lead; FK ON DELETE CASCADE removes its quiz responses + consent
-- records. Returns counts for an auditable confirmation.
-- (Phase 2: also clears/handles the Medusa customer link.)
create or replace function app.erase_lead(p_lead_id uuid)
returns table (deleted_lead int, deleted_quiz_responses int, deleted_consent_records int)
language plpgsql as $$
declare
  v_quiz int;
  v_consent int;
  v_lead int;
begin
  select count(*) into v_quiz from app.quiz_responses where lead_id = p_lead_id;
  select count(*) into v_consent from app.consent_records where lead_id = p_lead_id;
  delete from app.leads where id = p_lead_id;
  get diagnostics v_lead = row_count;
  return query select v_lead, v_quiz, v_consent;
end;
$$;
