-- ============================================
-- COMPLIANCE BRAIN — Supabase Database Schema
-- Run this in Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS / ACCOUNTS
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  account_type text default 'individual' check (account_type in ('individual', 'company')),
  industry text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- REGULATIONS DATABASE
-- ============================================
create table public.regulations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  country text not null,          -- 'Pakistan', 'UAE', 'Saudi Arabia', 'Egypt'
  industry text not null,         -- 'Textile', 'Construction', 'Pharmaceutical'
  category text not null,         -- 'Environmental', 'Safety', 'Financial', etc.
  document_name text not null,
  section_number text,
  page_number integer,
  line_number integer,
  content text not null,          -- The actual regulation text
  summary text,                   -- AI-generated summary
  effective_date date,
  last_updated timestamptz default now(),
  version integer default 1,
  is_active boolean default true,
  source_url text,
  created_at timestamptz default now()
);

create index idx_regulations_country on public.regulations(country);
create index idx_regulations_industry on public.regulations(industry);
create index idx_regulations_category on public.regulations(category);
create index idx_regulations_search on public.regulations using gin(to_tsvector('english', content || ' ' || title));

alter table public.regulations enable row level security;
create policy "Regulations are publicly readable" on public.regulations for select using (true);
create policy "Only service role can insert" on public.regulations for insert with check (auth.role() = 'service_role');

-- ============================================
-- CHAT SESSIONS & HISTORY
-- ============================================
create table public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  industry text,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;
create policy "Users see own sessions" on public.chat_sessions for all using (auth.uid() = user_id);

create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  references jsonb,   -- [{doc_name, section, page, line, country, industry}]
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;
create policy "Users see own messages" on public.chat_messages for all using (auth.uid() = user_id);

-- ============================================
-- DOCUMENT UPLOADS
-- ============================================
create table public.uploaded_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,       -- Supabase storage path
  file_size integer,
  industry text,
  country text,
  analysis_status text default 'pending' check (analysis_status in ('pending', 'analyzing', 'done', 'error')),
  analysis_result jsonb,         -- AI compliance gaps, issues found
  created_at timestamptz default now()
);

alter table public.uploaded_documents enable row level security;
create policy "Users see own docs" on public.uploaded_documents for all using (auth.uid() = user_id);

-- ============================================
-- COMPLIANCE REPORTS
-- ============================================
create table public.compliance_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  industry text not null,
  country text not null,
  company_name text,
  report_data jsonb not null,    -- Full report content
  pdf_path text,                 -- Supabase storage path for PDF
  status text default 'draft' check (status in ('draft', 'generated', 'downloaded')),
  created_at timestamptz default now()
);

alter table public.compliance_reports enable row level security;
create policy "Users see own reports" on public.compliance_reports for all using (auth.uid() = user_id);

-- ============================================
-- Storage Buckets (run separately in Supabase dashboard)
-- ============================================
-- Create bucket: "documents" (private)
-- Create bucket: "reports" (private)
