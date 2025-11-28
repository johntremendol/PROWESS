-- Run this in your Supabase SQL Editor

create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  currency text default '$',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  paid_by uuid references members(id) on delete cascade not null,
  date text not null, -- Storing as ISO string YYYY-MM-DD
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table groups enable row level security;
alter table members enable row level security;
alter table expenses enable row level security;

-- Create policies to allow public access (since this is a demo/simple app without auth)
-- IN PRODUCTION, YOU SHOULD USE AUTHENTICATED POLICIES
create policy "Public groups access" on groups for all using (true);
create policy "Public members access" on members for all using (true);
create policy "Public expenses access" on expenses for all using (true);

