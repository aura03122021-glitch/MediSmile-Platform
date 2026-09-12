-- MediSmile live database schema
-- Run once in Supabase Dashboard -> SQL Editor -> New query -> Run.

create extension if not exists "pgcrypto";

do $$ begin create type user_role as enum ('super_admin', 'subscriber', 'patient'); exception when duplicate_object then null; end $$;
do $$ begin create type account_status as enum ('pending', 'approved', 'rejected', 'suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'voided', 'insurance_pending'); exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'patient',
  status account_status not null default 'approved',
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  specialties text[] not null default '{}',
  bio text not null default '',
  clinic_name text not null default '',
  clinic_address text not null default '',
  city text not null default '',
  province text not null default '',
  latitude double precision,
  longitude double precision,
  prc_license_number text not null default '',
  prc_license_expiry date,
  prc_license_verified boolean not null default false,
  medical_degree text not null default '',
  board_certifications text[] not null default '{}',
  years_of_experience integer not null default 0,
  languages text[] not null default '{Filipino,English}',
  accepted_payment_methods text[] not null default '{cash,card,gcash,maya,bank_transfer,insurance}',
  accepted_hmos text[] not null default '{}',
  consultation_fee_cents integer not null default 50000 check (consultation_fee_cents >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0,
  is_accepting_patients boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  doctor_id uuid not null references doctor_profiles(id) on delete cascade,
  service_type text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  status appointment_status not null default 'pending',
  notes text,
  reason_for_visit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid not null references profiles(id) on delete cascade,
  doctor_id uuid not null references doctor_profiles(id) on delete restrict,
  service_description text not null,
  amount_cents integer not null check (amount_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  status invoice_status not null default 'draft',
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents integer not null default 0,
  description text not null default '',
  features text[] not null default '{}',
  max_practitioners integer,
  is_highlighted boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  value jsonb not null default '{}',
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists doctor_profiles_specialties_idx on doctor_profiles using gin (specialties);
create index if not exists doctor_profiles_location_idx on doctor_profiles (city, province);
create index if not exists appointments_patient_idx on appointments (patient_id, scheduled_at desc);
create index if not exists appointments_doctor_idx on appointments (doctor_id, scheduled_at desc);
create index if not exists invoices_patient_idx on invoices (patient_id, created_at desc);
create index if not exists invoices_status_idx on invoices (status);
create index if not exists subscription_tiers_sort_idx on subscription_tiers (sort_order);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();
drop trigger if exists doctor_profiles_set_updated_at on doctor_profiles;
create trigger doctor_profiles_set_updated_at before update on doctor_profiles for each row execute function set_updated_at();
drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at before update on appointments for each row execute function set_updated_at();
drop trigger if exists invoices_set_updated_at on invoices;
create trigger invoices_set_updated_at before update on invoices for each row execute function set_updated_at();
drop trigger if exists subscription_tiers_set_updated_at on subscription_tiers;
create trigger subscription_tiers_set_updated_at before update on subscription_tiers for each row execute function set_updated_at();

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare new_role user_role;
begin
  new_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient'::user_role);
  insert into profiles (id, email, full_name, role, status)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'User'), new_role,
    case when new_role = 'subscriber' then 'pending'::account_status else 'approved'::account_status end)
  on conflict (id) do nothing;
  if new_role = 'subscriber' then
    insert into doctor_profiles (profile_id) values (new.id) on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table doctor_profiles enable row level security;
alter table appointments enable row level security;
alter table invoices enable row level security;
alter table subscription_tiers enable row level security;
alter table site_content enable row level security;

create or replace function is_super_admin() returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'super_admin' and status = 'approved');
$$;

 drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles for select using (id = auth.uid() or is_super_admin());
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles for update using (id = auth.uid() or is_super_admin());

drop policy if exists doctor_profiles_public_read on doctor_profiles;
create policy doctor_profiles_public_read on doctor_profiles for select using (exists (select 1 from profiles where profiles.id = doctor_profiles.profile_id and profiles.status = 'approved'));
drop policy if exists doctor_profiles_owner_update on doctor_profiles;
create policy doctor_profiles_owner_update on doctor_profiles for update using (profile_id = auth.uid() or is_super_admin());
drop policy if exists doctor_profiles_admin_insert on doctor_profiles;
create policy doctor_profiles_admin_insert on doctor_profiles for insert with check (profile_id = auth.uid() or is_super_admin());

drop policy if exists appointments_read on appointments;
create policy appointments_read on appointments for select using (patient_id = auth.uid() or exists (select 1 from doctor_profiles where id = appointments.doctor_id and profile_id = auth.uid()) or is_super_admin());
drop policy if exists appointments_patient_insert on appointments;
create policy appointments_patient_insert on appointments for insert with check (patient_id = auth.uid());
drop policy if exists appointments_update on appointments;
create policy appointments_update on appointments for update using (patient_id = auth.uid() or exists (select 1 from doctor_profiles where id = appointments.doctor_id and profile_id = auth.uid()) or is_super_admin());

drop policy if exists invoices_read on invoices;
create policy invoices_read on invoices for select using (patient_id = auth.uid() or exists (select 1 from doctor_profiles where id = invoices.doctor_id and profile_id = auth.uid()) or is_super_admin());
drop policy if exists invoices_update on invoices;
create policy invoices_update on invoices for update using (exists (select 1 from doctor_profiles where id = invoices.doctor_id and profile_id = auth.uid()) or is_super_admin());
drop policy if exists invoices_admin_insert on invoices;
create policy invoices_admin_insert on invoices for insert with check (is_super_admin() or exists (select 1 from doctor_profiles where id = invoices.doctor_id and profile_id = auth.uid()));

drop policy if exists profiles_doctor_read on profiles;
create policy profiles_doctor_read on profiles for select using (exists (select 1 from appointments where appointments.patient_id = profiles.id and exists (select 1 from doctor_profiles where doctor_profiles.id = appointments.doctor_id and doctor_profiles.profile_id = auth.uid())));
drop policy if exists subscription_tiers_read on subscription_tiers;
create policy subscription_tiers_read on subscription_tiers for select using (is_active = true or is_super_admin());
drop policy if exists subscription_tiers_admin_write on subscription_tiers;
create policy subscription_tiers_admin_write on subscription_tiers for all using (is_super_admin()) with check (is_super_admin());
drop policy if exists site_content_read on site_content;
create policy site_content_read on site_content for select using (true);
drop policy if exists site_content_admin_write on site_content;
create policy site_content_admin_write on site_content for all using (is_super_admin()) with check (is_super_admin());

-- After running this schema, create a subscriber account, approve it by setting
-- profiles.status = 'approved', then insert its doctor_profiles row.
