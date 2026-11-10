-- FLIXO initial schema. Review and test RLS with Supabase local before production.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'viewer' check (role in ('viewer','creator','editor','admin')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  studio_name text,
  bio text,
  payout_status text not null default 'pending'
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  title text not null,
  slug text unique not null,
  synopsis text,
  genre text,
  poster_path text,
  status text not null default 'draft' check (status in ('draft','pending','revision','approved','published','rejected','archived')),
  rights_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  video_asset_id text,
  duration_seconds integer,
  is_free boolean not null default false,
  coin_price integer not null default 10 check (coin_price >= 0),
  status text not null default 'draft',
  unique(series_id, episode_number)
);

create table public.ip_rights (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  rights_type text not null,
  territory text not null,
  license_start date,
  license_end date,
  source_evidence_path text,
  music_rights_verified boolean not null default false,
  talent_releases_verified boolean not null default false,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz
);

create table public.content_submissions (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected','revision')),
  created_at timestamptz not null default now()
);

create table public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved','rejected','revision')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  cached_balance bigint not null default 0 check (cached_balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  amount bigint not null check (amount <> 0),
  transaction_type text not null check (transaction_type in ('purchase','unlock','refund','adjustment','creator_credit')),
  reference_type text not null,
  reference_id text not null,
  idempotency_key text unique not null,
  created_at timestamptz not null default now()
);

create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  provider text not null,
  provider_order_id text,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'THB',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  verified boolean not null default false,
  processed_at timestamptz,
  unique(provider, provider_event_id)
);

create table public.episode_unlocks (
  user_id uuid not null references public.profiles(id),
  episode_id uuid not null references public.episodes(id),
  transaction_id uuid references public.wallet_transactions(id),
  created_at timestamptz not null default now(),
  primary key(user_id, episode_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  provider text,
  provider_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz
);

create table public.watch_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  episode_id uuid not null references public.episodes(id),
  event_type text not null,
  position_seconds integer not null default 0,
  session_id text,
  created_at timestamptz not null default now()
);

create table public.creator_revenue (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  series_id uuid references public.series(id),
  gross_minor bigint not null default 0,
  creator_share_minor bigint not null default 0,
  platform_share_minor bigint not null default 0,
  period_start date,
  period_end date
);

create table public.payout_records (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'pending',
  reference text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_series_status on public.series(status);
create index idx_episodes_series on public.episodes(series_id, episode_number);
create index idx_wallet_tx_user_time on public.wallet_transactions(user_id, created_at desc);
create index idx_watch_events_user_time on public.watch_events(user_id, created_at desc);

-- RLS defaults to deny. These policies only grant user-owned read access and public published catalog reads.
alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.ip_rights enable row level security;
alter table public.content_submissions enable row level security;
alter table public.content_reviews enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_webhooks enable row level security;
alter table public.episode_unlocks enable row level security;
alter table public.subscriptions enable row level security;
alter table public.watch_events enable row level security;
alter table public.creator_revenue enable row level security;
alter table public.payout_records enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read self" on public.profiles for select using (auth.uid() = id);
create policy "creator profile read self" on public.creator_profiles for select using (auth.uid() = user_id);
create policy "published series public read" on public.series for select using (status = 'published' and rights_verified = true);
create policy "creator reads own series" on public.series for select using (auth.uid() = creator_id);
create policy "published episodes public read" on public.episodes for select using (
  exists (select 1 from public.series s where s.id = series_id and s.status = 'published' and s.rights_verified = true)
);
create policy "wallet read self" on public.wallets for select using (auth.uid() = user_id);
create policy "wallet transactions read self" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "payment orders read self" on public.payment_orders for select using (auth.uid() = user_id);
create policy "unlock read self" on public.episode_unlocks for select using (auth.uid() = user_id);
create policy "subscriptions read self" on public.subscriptions for select using (auth.uid() = user_id);
create policy "watch events read self" on public.watch_events for select using (auth.uid() = user_id);

-- No client-side wallet/payment writes. Use trusted server functions with service role, verified webhooks,
-- atomic ledger posting, and an idempotency key before enabling monetization.
