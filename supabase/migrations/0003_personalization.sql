-- Phase 3: personalization data. Identified-only (lead-keyed); anonymous activity
-- stays client-side and is never persisted as identity. Erasure cascades via FKs.

-- ── Wishlist / save-for-later ────────────────────────────────────────────────
create table if not exists app.wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references app.leads (id) on delete cascade,
  product_handle text not null,
  created_at    timestamptz not null default now(),
  unique (lead_id, product_handle)
);
create index if not exists wishlist_lead_idx on app.wishlist_items (lead_id);

-- ── Viewed products (feeds cross-sell; identified only) ──────────────────────
create table if not exists app.product_views (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references app.leads (id) on delete cascade,
  product_handle text not null,
  viewed_at     timestamptz not null default now()
);
create index if not exists product_views_lead_idx on app.product_views (lead_id);

-- ── Re-engagement + unsubscribe ──────────────────────────────────────────────
alter table app.leads add column if not exists last_seen_at timestamptz;
alter table app.leads add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
create unique index if not exists leads_unsubscribe_token_idx on app.leads (unsubscribe_token);
