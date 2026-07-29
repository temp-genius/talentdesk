-- VettedTA Leads — initial schema
-- Tables, RLS policies, triggers, and RSS source seed data.

create extension if not exists pgcrypto;

-- =========================================================================
-- Companies
-- =========================================================================
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  logo_url text,
  headcount_bracket text, -- '1-10', '11-50', '51-200', '200+'
  location text,
  country text, -- 'Ireland', 'UK', 'Other'
  specialism_bucket text[], -- ['Software Engineering', 'Data/AI', 'Product Management']
  description text,
  linkedin_company_url text,
  enriched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index companies_name_idx on companies (lower(name));
create index companies_domain_idx on companies (lower(domain));

-- =========================================================================
-- Signals
-- =========================================================================
create table signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  signal_type text not null, -- 'funding', 'senior_hire', 'job_posting', 'expansion', 'careers_page'
  signal_date timestamptz,
  headline text,
  detail text,
  source_url text,
  source_name text,
  funding_amount text,
  funding_currency text,
  raw_content text,
  created_at timestamptz default now()
);

create index signals_company_idx on signals (company_id);
create index signals_type_idx on signals (signal_type);
create index signals_date_idx on signals (signal_date desc);
-- Prevent the same article being ingested twice
create unique index signals_source_url_unique on signals (source_url) where source_url is not null;

-- =========================================================================
-- Contacts
-- =========================================================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  title text,
  linkedin_url text,
  email text,
  confidence_score integer, -- 0-100, how confident we are this is the right person
  title_category text, -- 'founder', 'people', 'tech', 'ops', 'commercial'
  is_primary_contact boolean default false,
  created_at timestamptz default now()
);

create index contacts_company_idx on contacts (company_id);

-- =========================================================================
-- User profiles (extends Supabase auth.users)
-- =========================================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  role text,
  plan text default 'beta', -- 'beta', 'free', 'pro'
  created_at timestamptz default now()
);

-- =========================================================================
-- Outreach tracking
-- =========================================================================
create table outreach (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  status text default 'new', -- 'new', 'connection_sent', 'connected', 'follow_up_1_sent', 'follow_up_2_sent', 'replied', 'call_booked', 'active_client', 'not_now', 'dead'
  connected_date timestamptz,
  follow_up_1_due timestamptz,
  follow_up_2_due timestamptz,
  last_message text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index outreach_user_idx on outreach (user_id);
create index outreach_company_idx on outreach (company_id);
create index outreach_status_idx on outreach (status);

-- =========================================================================
-- RSS sources
-- =========================================================================
create table rss_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  country text default 'Ireland',
  is_active boolean default true,
  last_fetched_at timestamptz,
  created_at timestamptz default now()
);

insert into rss_sources (name, url, country) values
  ('Silicon Republic', 'https://www.siliconrepublic.com/feed', 'Ireland'),
  ('Tech.eu Ireland', 'https://tech.eu/feed/', 'Ireland'),
  ('The Currency', 'https://thecurrency.news/feed/', 'Ireland'),
  ('EU-Startups', 'https://eu-startups.com/feed/', 'Europe'),
  ('Irish Times Business', 'https://www.irishtimes.com/business/?feed=rss', 'Ireland');

-- =========================================================================
-- updated_at helper
-- =========================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

create trigger outreach_set_updated_at
  before update on outreach
  for each row execute function set_updated_at();

-- =========================================================================
-- Auto-create a user_profiles row when someone signs up
-- =========================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name, company, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company',
    new.raw_user_meta_data ->> 'role'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table companies enable row level security;
alter table signals enable row level security;
alter table contacts enable row level security;
alter table user_profiles enable row level security;
alter table outreach enable row level security;
alter table rss_sources enable row level security;

-- Lead data (companies/signals/contacts) is a shared pool: any signed-in
-- user can read it. Writes only happen from Edge Functions using the
-- service role key, which bypasses RLS, so no write policies are defined.
create policy "Authenticated users can view companies"
  on companies for select
  to authenticated
  using (true);

create policy "Authenticated users can view signals"
  on signals for select
  to authenticated
  using (true);

create policy "Authenticated users can view contacts"
  on contacts for select
  to authenticated
  using (true);

create policy "Authenticated users can view rss sources"
  on rss_sources for select
  to authenticated
  using (true);

-- Users can only see and manage their own profile
create policy "Users can view own profile"
  on user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Outreach records are private to the recruiter who owns them
create policy "Users can view own outreach"
  on outreach for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own outreach"
  on outreach for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own outreach"
  on outreach for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own outreach"
  on outreach for delete
  to authenticated
  using (auth.uid() = user_id);
