create extension if not exists "pgcrypto";

do $$
begin
  alter type public.order_type add value if not exists 'personal';
  alter type public.order_type add value if not exists 'service';
  alter type public.order_type add value if not exists 'product';
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  birthday date,
  referral_code text unique,
  referred_by uuid references public.users_profile(id) on delete set null,
  tier_rate numeric not null default 0,
  tier_unlocked_at timestamptz,
  total_referred_sales numeric not null default 0,
  total_commission_earned numeric not null default 0,
  points_balance integer not null default 0,
  months_under_50 integer not null default 0,
  last_keepalive_month date,
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists amount_total numeric,
  add column if not exists cash_paid numeric,
  add column if not exists points_redeemed integer not null default 0;

update public.orders
set amount_total = coalesce(amount_total, amount_cents / 100.0),
    cash_paid = coalesce(cash_paid, amount_cents / 100.0)
where amount_total is null or cash_paid is null;

alter table public.orders
  alter column amount_total set not null,
  alter column cash_paid set not null;

create table if not exists public.referral_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders(id) on delete cascade,
  referrer_id uuid not null references public.users_profile(id) on delete cascade,
  referred_user_id uuid not null references public.users_profile(id) on delete cascade,
  commission_rate numeric not null,
  commission_amount numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  points integer not null,
  action text not null check (action in ('earn', 'redeem', 'adjust')),
  order_id uuid references public.orders(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  month date not null,
  personal_cash_total numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.frequency_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  report_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  week_start date not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists users_profile_referral_code_idx on public.users_profile(referral_code);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists referral_orders_referrer_created_idx on public.referral_orders(referrer_id, created_at desc);
create index if not exists points_ledger_user_created_idx on public.points_ledger(user_id, created_at desc);
create index if not exists frequency_reports_user_created_idx on public.frequency_reports(user_id, created_at desc);

create or replace function public.generate_referral_code(seed_text text)
returns text as $$
declare
  candidate text;
begin
  candidate := upper(regexp_replace(coalesce(seed_text, ''), '[^a-zA-Z0-9]', '', 'g'));
  candidate := left(candidate, 6);

  if candidate = '' then
    candidate := substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
  end if;

  loop
    exit when not exists (
      select 1 from public.users_profile where referral_code = candidate
    );
    candidate := candidate || substr(encode(gen_random_bytes(2), 'hex'), 1, 2);
    candidate := left(candidate, 10);
  end loop;

  return candidate;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  referred_code text;
  referrer_profile_id uuid;
  seeded_name text;
begin
  referred_code := nullif(new.raw_user_meta_data ->> 'referred_code', '');
  seeded_name := nullif(new.raw_user_meta_data ->> 'name', '');

  if referred_code is not null then
    select id into referrer_profile_id
    from public.users_profile
    where referral_code = upper(referred_code)
    limit 1;
  end if;

  insert into public.users (id, email, phone, name, birth_date)
  values (
    new.id,
    new.email,
    new.phone,
    seeded_name,
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = excluded.phone,
        name = coalesce(excluded.name, public.users.name),
        birth_date = coalesce(excluded.birth_date, public.users.birth_date),
        updated_at = now();

  insert into public.users_profile (
    id,
    name,
    birthday,
    referral_code,
    referred_by
  )
  values (
    new.id,
    seeded_name,
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date,
    public.generate_referral_code(coalesce(seeded_name, new.email, substr(new.id::text, 1, 8))),
    referrer_profile_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

alter table public.users_profile enable row level security;
alter table public.referral_orders enable row level security;
alter table public.points_ledger enable row level security;
alter table public.monthly_stats enable row level security;
alter table public.frequency_reports enable row level security;
alter table public.weekly_reminders enable row level security;

create policy "Users can view own users_profile"
on public.users_profile for select
using (auth.uid() = id);

create policy "Users can update own users_profile"
on public.users_profile for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can view own referral orders"
on public.referral_orders for select
using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

create policy "Users can view own points ledger"
on public.points_ledger for select
using (auth.uid() = user_id);

create policy "Users can view own monthly stats"
on public.monthly_stats for select
using (auth.uid() = user_id);

create policy "Users can view own frequency reports"
on public.frequency_reports for select
using (auth.uid() = user_id);

create policy "Users can insert own frequency reports"
on public.frequency_reports for insert
with check (auth.uid() = user_id);

create policy "Users can update own frequency reports"
on public.frequency_reports for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can view own weekly reminders"
on public.weekly_reminders for select
using (auth.uid() = user_id);

create policy "Users can insert own weekly reminders"
on public.weekly_reminders for insert
with check (auth.uid() = user_id);

create policy "Users can update own weekly reminders"
on public.weekly_reminders for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
