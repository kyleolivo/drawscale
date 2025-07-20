-- Create users table
create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  email text null,
  provider text null,
  apple_id_token text null,
  first_name text null,
  last_name text null,
  banhammer boolean null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;

-- Create indexes for better query performance
create index users_email_idx on public.users (email);
create index users_provider_idx on public.users (provider);
create index users_apple_id_token_idx on public.users (apple_id_token);
create index users_banhammer_idx on public.users (banhammer);
create index users_created_at_idx on public.users (created_at);

-- Add unique constraint on email
create unique index users_email_unique_idx on public.users (email) where email is not null;

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies for secure access
-- Allow public access for user lookup by email and Apple ID token (for authentication)
create policy "Allow public user lookup for authentication" on public.users
  for select using (true);

-- Allow public access for user creation (for new sign-ups)
create policy "Allow public user creation" on public.users
  for insert with check (true);

-- Allow public access for user updates (for profile updates)
create policy "Allow public user updates" on public.users
  for update using (true);
