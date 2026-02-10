-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.testimonial_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.course_session_status as enum ('DRAFT', 'PUBLISHED', 'CANCELLED');
create type public.order_type as enum ('COURSE', 'MENTOR_DEPOSIT', 'ROOM');
create type public.payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
create type public.booking_status as enum ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
create type public.mentor_availability_status as enum ('OPEN', 'BLOCKED');
create type public.room_slot_status as enum ('OPEN', 'BLOCKED');
create type public.room_booking_status as enum ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');

-- Tables
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  name text,
  birth_date date,
  whatsapp text,
  member_tier text default 'STANDARD',
  status text default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text not null,
  subtitle text,
  description text,
  benefits jsonb default '[]'::jsonb,
  faq jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  category text,
  title text,
  content text,
  media_urls jsonb default '[]'::jsonb,
  is_anonymous boolean default false,
  consent_public boolean default false,
  status public.testimonial_status default 'PENDING',
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text,
  description text,
  highlights jsonb default '[]'::jsonb,
  duration_text text,
  level text,
  location_text text,
  cover_image text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text default 'Asia/Kuala_Lumpur',
  venue_name text,
  venue_address text,
  capacity integer not null default 20,
  price_cents integer not null default 0,
  currency text default 'MYR',
  status public.course_session_status default 'DRAFT',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  display_name text not null,
  bio text,
  specialties jsonb default '[]'::jsonb,
  locations jsonb default '[]'::jsonb,
  avatar_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references public.mentors(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text default 'Asia/Kuala_Lumpur',
  location_text text,
  status public.mentor_availability_status default 'OPEN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  mentor_id uuid references public.mentors(id) on delete cascade,
  availability_id uuid references public.mentor_availability(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  location_text text,
  notes text,
  booking_status public.booking_status default 'REQUESTED',
  deposit_required boolean default false,
  deposit_amount_cents integer default 0,
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  order_type public.order_type not null,
  course_session_id uuid references public.course_sessions(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  amount_cents integer not null,
  currency text default 'MYR',
  payment_provider text default 'BANK_TRANSFER',
  payment_method text default 'BANK_TRANSFER',
  payment_status public.payment_status default 'PENDING',
  provider_session_id text,
  provider_payment_intent_id text,
  slip_url text,
  slip_uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  role text not null
);

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity integer not null,
  open_time text default '11:00',
  close_time text default '17:00',
  timezone text default 'Asia/Kuala_Lumpur',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.room_slots (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text default 'Asia/Kuala_Lumpur',
  status public.room_slot_status default 'OPEN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists room_slots_unique on public.room_slots (room_id, start_at);

create table if not exists public.room_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  room_slot_id uuid references public.room_slots(id) on delete cascade,
  party_size integer not null,
  status public.room_booking_status default 'PENDING_PAYMENT',
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.room_booking_attendees (
  id uuid primary key default gen_random_uuid(),
  room_booking_id uuid references public.room_bookings(id) on delete cascade,
  name text,
  contact text,
  created_at timestamptz default now()
);

-- Views
create or replace view public.room_slots_view as
select
  rs.id,
  rs.room_id,
  r.name as room_name,
  rs.start_at,
  rs.end_at,
  rs.status,
  r.capacity as total_capacity,
  greatest(r.capacity - coalesce(sum(rb.party_size) filter (where rb.status = 'CONFIRMED'), 0), 0) as remaining_capacity
from public.room_slots rs
join public.rooms r on r.id = rs.room_id
left join public.room_bookings rb on rb.room_slot_id = rs.id
group by rs.id, r.id;

-- Trigger to sync auth.users -> public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, phone)
  values (new.id, new.email, new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Course confirmation with locking
create or replace function public.confirm_course_enrollment(order_id_input uuid)
returns void as $$
declare
  v_session_id uuid;
  v_capacity integer;
  v_count integer;
begin
  select course_session_id into v_session_id
  from public.orders where id = order_id_input;

  if v_session_id is null then
    raise exception 'Order missing course session';
  end if;

  select capacity into v_capacity
  from public.course_sessions
  where id = v_session_id
  for update;

  select count(*) into v_count
  from public.orders
  where course_session_id = v_session_id
    and payment_status = 'PAID';

  if v_count > v_capacity then
    raise exception 'Capacity exceeded';
  end if;
end;
$$ language plpgsql security definer;

-- Mentor booking confirmation
create or replace function public.confirm_mentor_booking(order_id_input uuid)
returns void as $$
declare
  v_booking_id uuid;
begin
  select booking_id into v_booking_id from public.orders where id = order_id_input;
  if v_booking_id is null then
    raise exception 'Order missing booking';
  end if;
  update public.bookings
    set booking_status = 'CONFIRMED', confirmed_at = now(), updated_at = now()
    where id = v_booking_id;
end;
$$ language plpgsql security definer;

-- Room booking confirmation with locking
create or replace function public.confirm_room_booking(order_id_input uuid)
returns void as $$
declare
  v_booking record;
  v_capacity integer;
  v_used integer;
  v_remaining integer;
begin
  select rb.*, rs.room_id into v_booking
  from public.room_bookings rb
  join public.room_slots rs on rs.id = rb.room_slot_id
  where rb.id = (select booking_id from public.orders where id = order_id_input)
  for update;

  if v_booking.id is null then
    raise exception 'Room booking not found';
  end if;

  select capacity into v_capacity from public.rooms where id = v_booking.room_id;

  select coalesce(sum(party_size), 0) into v_used
  from public.room_bookings
  where room_slot_id = v_booking.room_slot_id and status = 'CONFIRMED';

  v_remaining := v_capacity - v_used;

  if v_remaining < v_booking.party_size then
    raise exception 'Room capacity exceeded';
  end if;

  update public.room_bookings
    set status = 'CONFIRMED', confirmed_at = now(), updated_at = now()
    where id = v_booking.id;
end;
$$ language plpgsql security definer;

-- Process paid order with capacity checks in one transaction
create or replace function public.process_paid_order(order_id_input uuid, payment_intent_input text)
returns void as $$
declare
  v_order record;
begin
  select * into v_order from public.orders where id = order_id_input for update;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  update public.orders
    set payment_status = 'PAID',
        provider_payment_intent_id = payment_intent_input,
        paid_at = now(),
        updated_at = now()
    where id = v_order.id;

  if v_order.order_type = 'COURSE' then
    perform public.confirm_course_enrollment(v_order.id);
  elsif v_order.order_type = 'MENTOR_DEPOSIT' then
    perform public.confirm_mentor_booking(v_order.id);
  elsif v_order.order_type = 'ROOM' then
    perform public.confirm_room_booking(v_order.id);
  end if;
end;
$$ language plpgsql security definer;

-- Generate room slots for next N days
create or replace function public.generate_room_slots(days_ahead integer default 60)
returns void as $$
declare
  v_room record;
  v_date date;
  v_start timestamptz;
  v_end timestamptz;
  v_hour integer;
begin
  for v_room in select * from public.rooms loop
    for v_date in select (current_date + i) from generate_series(0, days_ahead - 1) as i loop
      for v_hour in 11..16 loop
        v_start := (v_date::text || ' ' || lpad(v_hour::text, 2, '0') || ':00')::timestamptz at time zone v_room.timezone;
        v_end := (v_date::text || ' ' || lpad((v_hour + 1)::text, 2, '0') || ':00')::timestamptz at time zone v_room.timezone;

        insert into public.room_slots (room_id, start_at, end_at, timezone)
        values (v_room.id, v_start, v_end, v_room.timezone)
        on conflict do nothing;
      end loop;
    end loop;
  end loop;
end;
$$ language plpgsql security definer;

-- RLS
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.testimonials enable row level security;
alter table public.courses enable row level security;
alter table public.course_sessions enable row level security;
alter table public.mentors enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.orders enable row level security;
alter table public.rooms enable row level security;
alter table public.room_slots enable row level security;
alter table public.room_bookings enable row level security;
alter table public.room_booking_attendees enable row level security;
alter table public.admin_roles enable row level security;

-- Policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Public products" on public.products for select using (is_published = true);
create policy "Public courses" on public.courses for select using (is_published = true);
create policy "Public course sessions" on public.course_sessions for select using (status = 'PUBLISHED');
create policy "Public mentors" on public.mentors for select using (is_active = true);
create policy "Public testimonials" on public.testimonials for select using (status = 'APPROVED');

create policy "Members insert testimonials" on public.testimonials for insert with check (auth.uid() = user_id);

create policy "Members view their bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Members insert bookings" on public.bookings for insert with check (auth.uid() = user_id);

create policy "Mentors view own bookings" on public.bookings for select using (
  auth.uid() = (select user_id from public.mentors where id = mentor_id)
);

create policy "Members view orders" on public.orders for select using (auth.uid() = user_id);
create policy "Members insert orders" on public.orders for insert with check (auth.uid() = user_id);

create policy "Members view room bookings" on public.room_bookings for select using (auth.uid() = user_id);
create policy "Members insert room bookings" on public.room_bookings for insert with check (auth.uid() = user_id);

create policy "Public rooms view" on public.rooms for select using (true);
create policy "Public room slots view" on public.room_slots for select using (status = 'OPEN');

create policy "Users read own admin role" on public.admin_roles for select using (auth.uid() = user_id);

-- Admin policies via service role bypass or admin check handled server-side
