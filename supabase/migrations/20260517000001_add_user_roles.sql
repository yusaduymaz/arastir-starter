-- supabase/migrations/20260517000001_add_user_roles.sql

-- User Roles
create type public.app_role as enum ('user', 'admin');

-- Add role to users table
alter table public.users
add column role app_role not null default 'user';

-- Enable RLS
alter table public.users enable row level security;

-- Policies for users
create policy "Admins can manage all users" on public.users for all using (auth.uid()::text in (select id from public.users where role = 'admin'));
create policy "Users can view their own data" on public.users for select using (auth.uid()::text = id);
