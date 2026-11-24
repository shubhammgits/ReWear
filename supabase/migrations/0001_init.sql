-- ReWear Phase A schema: outfits, photos, bookings, payments, refunds, lender payouts.
-- Run once in Supabase: SQL Editor → paste → Run (or `supabase db push`).
-- Money is stored in whole rupees; Razorpay amounts are converted to paise in the app.

create extension if not exists btree_gist with schema extensions;

-- ───────────── People ─────────────

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role text not null default 'renter' check (role in ('renter', 'lender', 'admin')),
  created_at timestamptz not null default now()
);

-- Every new sign-in gets a profile row
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Owners of outfits. Phase A: added by the admin (team and friends, no account needed).
-- Phase B: profile_id links a lender who signed up; razorpay_account_id is their Route linked account.
create table public.lenders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles on delete set null,
  name text not null,
  phone text,
  upi_id text,
  notes text,
  razorpay_account_id text,
  created_at timestamptz not null default now()
);

-- ───────────── Catalogue ─────────────

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  lender_id uuid not null references public.lenders,
  name text not null,
  category text not null check (category in ('Indian', 'Western')),
  type text not null,
  occasions text[] not null default '{}',
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  measurements text,
  description text not null default '',
  fabric text,
  color text,
  -- The lender's prices; renters pay these plus the service, cleaning and protection fees
  price_4h integer not null check (price_4h > 0),
  price_day integer not null check (price_day >= price_4h),
  price_3days integer not null check (price_3days >= price_day),
  cleaning_fee integer not null default 0 check (cleaning_fee >= 0),
  status text not null default 'draft' check (status in ('draft', 'live', 'paused', 'retired')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outfit_photos (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits on delete cascade,
  path text not null, -- object path in the outfit-photos storage bucket
  alt text not null default '',
  position integer not null default 0
);
create index outfit_photos_outfit_idx on public.outfit_photos (outfit_id, position);

-- ───────────── Bookings ─────────────

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  outfit_id uuid not null references public.outfits,
  renter_id uuid not null references public.profiles,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- ends_at plus the cleaning turnaround; the outfit is unavailable until then
  blocked_until timestamptz not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'handed_over', 'returned', 'cancelled', 'expired')),
  -- Unpaid bookings hold the dates only until this time
  hold_expires_at timestamptz,
  rent integer not null,
  service_fee integer not null,
  cleaning_fee integer not null,
  protection_fee integer not null,
  total integer not null,
  handover text not null default 'pickup' check (handover in ('pickup', 'delivery')),
  contact_phone text not null,
  address text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at and blocked_until >= ends_at),
  check (total = rent + service_fee + cleaning_fee + protection_fee),
  -- The double-booking guard: no two active bookings of one outfit may overlap, cleaning time included.
  -- Postgres enforces this even when two people pay at the same moment.
  constraint no_double_booking exclude using gist (
    outfit_id with =,
    tstzrange(starts_at, blocked_until, '[)') with &&
  ) where (status in ('pending_payment', 'confirmed', 'handed_over'))
);
create index bookings_renter_idx on public.bookings (renter_id, starts_at desc);

-- Frees dates held by checkouts that were never paid. Called before every new hold.
create function public.expire_stale_holds() returns void
language sql security definer set search_path = '' as $$
  update public.bookings set status = 'expired'
  where status = 'pending_payment' and hold_expires_at < now();
$$;

-- Busy periods for an outfit's calendar, without revealing who booked them
create function public.outfit_busy(p_outfit uuid)
returns table (starts_at timestamptz, blocked_until timestamptz)
language sql stable security definer set search_path = '' as $$
  select b.starts_at, b.blocked_until from public.bookings b
  where b.outfit_id = p_outfit
    and b.blocked_until > now()
    and (b.status in ('confirmed', 'handed_over')
         or (b.status = 'pending_payment' and b.hold_expires_at > now()));
$$;

-- ───────────── Money ─────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  amount_paise integer not null,
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded', 'partially_refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments,
  razorpay_refund_id text unique,
  amount_paise integer not null check (amount_paise > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

-- What each lender is owed per rental. Phase A: paid by hand and marked paid by the admin.
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings,
  lender_id uuid not null references public.lenders,
  amount integer not null check (amount >= 0),
  status text not null default 'owed' check (status in ('owed', 'paid', 'void')),
  paid_at timestamptz,
  reference text, -- UPI or bank transfer reference
  created_at timestamptz not null default now()
);

-- ───────────── Access rules (row level security) ─────────────
-- The website's server uses the service role key for payments and holds, which bypasses these rules.

alter table public.profiles enable row level security;
alter table public.lenders enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_photos enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.payouts enable row level security;

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "edit own profile" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "admin edits profiles" on public.profiles for update using (public.is_admin());

create policy "admin manages lenders" on public.lenders for all using (public.is_admin()) with check (public.is_admin());

create policy "anyone sees live outfits" on public.outfits for select using (status = 'live' or public.is_admin());
create policy "admin manages outfits" on public.outfits for all using (public.is_admin()) with check (public.is_admin());

create policy "anyone sees photos of live outfits" on public.outfit_photos for select
  using (public.is_admin() or exists (select 1 from public.outfits o where o.id = outfit_id and o.status = 'live'));
create policy "admin manages photos" on public.outfit_photos for all using (public.is_admin()) with check (public.is_admin());

create policy "renter sees own bookings" on public.bookings for select using (renter_id = auth.uid() or public.is_admin());
create policy "admin manages bookings" on public.bookings for update using (public.is_admin());

create policy "renter sees own payments" on public.payments for select
  using (public.is_admin() or exists (select 1 from public.bookings b where b.id = booking_id and b.renter_id = auth.uid()));
create policy "admin sees refunds" on public.refunds for select using (public.is_admin());
create policy "admin manages payouts" on public.payouts for all using (public.is_admin()) with check (public.is_admin());

grant execute on function public.outfit_busy(uuid) to anon, authenticated;

-- ───────────── Photo storage ─────────────

insert into storage.buckets (id, name, public) values ('outfit-photos', 'outfit-photos', true)
  on conflict (id) do nothing;

create policy "admin uploads outfit photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'outfit-photos' and public.is_admin());
create policy "admin edits outfit photos" on storage.objects for update to authenticated
  using (bucket_id = 'outfit-photos' and public.is_admin());
create policy "admin deletes outfit photos" on storage.objects for delete to authenticated
  using (bucket_id = 'outfit-photos' and public.is_admin());
