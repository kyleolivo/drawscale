-- Add google_id_token column to users table
alter table public.users add column google_id_token text null;

-- Create index for better query performance
create index users_google_id_token_idx on public.users (google_id_token);