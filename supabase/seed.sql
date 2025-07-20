-- Seed file for development data
-- This file contains development-specific data and policies

-- Insert dev user for development (only if it doesn't exist)
insert into public.users (id, email, provider, first_name, last_name, apple_id_token, banhammer)
select 
  gen_random_uuid(),
  'dev@example.com',
  'dev',
  'Dev',
  'User',
  'dev-token',
  false
where not exists (
  select 1 from public.users where email = 'dev@example.com'
);

-- Allow access to dev user for development (by email)
create policy "Allow dev user access" on public.users
  for select using (email = 'dev@example.com');

-- Allow updates to dev user for development
create policy "Allow dev user updates" on public.users
  for update using (email = 'dev@example.com');
