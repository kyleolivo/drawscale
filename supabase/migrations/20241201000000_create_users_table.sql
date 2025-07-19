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
-- Allow users to read their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid()::text = id::text);

-- Allow users to update their own data
create policy "Users can update own data" on public.users
  for update using (auth.uid()::text = id::text);

-- Allow service role to perform all operations (for admin functions)
create policy "Service role can perform all operations" on public.users
  for all using (auth.role() = 'service_role' or auth.jwt() ->> 'role' = 'service_role');

-- Create a function to automatically create a user record when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, provider)
  values (new.id, new.email, new.raw_app_meta_data->>'provider');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create user record on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 