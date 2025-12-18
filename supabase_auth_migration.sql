-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Trigger for new users (Handle new signups)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Drop trigger if exists to avoid duplication error on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update Groups table
alter table public.groups add column if not exists created_by uuid references public.profiles(id);

-- Update Members table
alter table public.members add column if not exists user_id uuid references public.profiles(id);
alter table public.members add column if not exists email text;
alter table public.members add column if not exists status text default 'active'; 

-- Linking Function: Link existing member by email when user signs up/logs in
-- We can call this via RPC or Trigger. Trigger on Profile creation is best.
create or replace function public.link_profile_to_members()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.members
  set user_id = new.id, status = 'active'
  where email = new.email and user_id is null;
  return new;
end;
$$;

drop trigger if exists on_profile_created_link_members on public.profiles;
create trigger on_profile_created_link_members
  after insert on public.profiles
  for each row execute procedure public.link_profile_to_members();

-- RLS Enable
alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.expenses enable row level security;

-- PROVISIONAL POLICIES --
-- NOTE: You may need to adjust these for strictness. 
-- For now, we allow authenticated users to see groups they are part of.

-- GROUPS
drop policy if exists "Access groups" on groups;
create policy "Access groups" on groups
for all
to authenticated
using (
  created_by = auth.uid() or
  exists (
    select 1 from members
    where members.group_id = groups.id
    and members.user_id = auth.uid()
  )
)
with check (
   -- Allow creation if authenticated (created_by check typically handled by DB constraint or default)
   -- Allow update if member
   true
);

-- Allow insert specifically for authenticated users
create policy "Allow insert group" on groups for insert to authenticated with check (true);


-- MEMBERS
drop policy if exists "Access members" on members;
create policy "Access members" on members
for all
to authenticated
using (
  -- Can see members of groups I belong to
  exists (
    select 1 from members as m
    where m.group_id = members.group_id
    and m.user_id = auth.uid()
  )
  or
  -- Can see my own member records (even if not fully linked/active?)
  user_id = auth.uid()
);

-- Allow insert member if you have access to the group (i.e. you are creating the group)
create policy "Allow insert member" on members for insert to authenticated with check (true);


-- EXPENSES
drop policy if exists "Access expenses" on expenses;
create policy "Access expenses" on expenses
for all
to authenticated
using (
  exists (
    select 1 from groups
    where groups.id = expenses.group_id
    and (
        groups.created_by = auth.uid() or
        exists (
           select 1 from members
           where members.group_id = groups.id
           and members.user_id = auth.uid()
        )
    )
  )
);
