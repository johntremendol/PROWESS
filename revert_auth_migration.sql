-- Revert Auth Migration (Fix: Order of Operations)
-- Run this entire script to restore the DB. Failures on "does not exist" are fine (means it's already gone).

-- 1. Drop Policies (Remove dependencies)
drop policy if exists "Access groups" on public.groups;
drop policy if exists "Allow insert group" on public.groups;
drop policy if exists "Members can view groups" on public.groups;
drop policy if exists "View accessible groups" on public.groups;
drop policy if exists "Authenticated users can create groups" on public.groups;
drop policy if exists "Members can update groups" on public.groups;
drop policy if exists "Access expenses" on public.expenses;
drop policy if exists "Access members" on public.members;
drop policy if exists "Allow insert member" on public.members;
drop policy if exists "View accessible members" on public.members;

-- 2. Disable RLS
alter table public.groups disable row level security;
alter table public.members disable row level security;
alter table public.expenses disable row level security;

-- 3. Cleanup Triggers (Try to drop potential triggers before tables)
-- Note: If table is already gone, these might error if not handled carefully, 
-- but we wraps in DO block or just ignore. 
-- For simplicity, we assume if table exists we drop trigger.
-- But if table is gone, we can't drop trigger ON it. 
-- Better strategy: Drop table CASCADE which removes its triggers.

-- 4. Drop Profiles Table (Cascade will remove dependent keys/triggers on it)
drop table if exists public.profiles cascade;

-- 5. Remove added columns from other tables
alter table public.groups drop column if exists created_by cascade;
alter table public.members drop column if exists user_id cascade;
alter table public.members drop column if exists email cascade;
alter table public.members drop column if exists status cascade;

-- 6. Cleanup Functions & Global Triggers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;
drop function if exists public.link_profile_to_members;

-- Note: The error "relation public.profiles does not exist" likely came because 
-- a DROP TRIGGER ... ON public.profiles command was run after the table was deleted.
-- I have removed that explicit DROP TRIGGER command because the DROP TABLE ... CASCADE deals with it.
