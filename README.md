# Prowess Playgrounds

A creative studio collection featuring the Splitter finance app, built with React, Tailwind CSS, and Google Gemini.

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Local Development

Start the development server:

```bash
npm run dev
```

Create a `.env` file in the root directory for your keys:

```
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## ☁️ Deployment Guide (Vercel)

1.  Push this code to a **GitHub** repository.
2.  Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import your GitHub repository.
4.  Vercel will automatically detect **Vite**.
5.  In the **Environment Variables** section, add:
    *   `VITE_GEMINI_API_KEY`
    *   `VITE_SUPABASE_URL` (see below)
    *   `VITE_SUPABASE_ANON_KEY` (see below)
6.  Click **Deploy**.

## ⚡ Supabase Integration

This project includes a pre-configured Supabase client in `lib/supabase.ts`.

### 1. Setup Supabase
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  In **Project Settings > API**, copy the `Project URL` and `anon public` Key.
3.  Add these to your Vercel Environment Variables as:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`

### 2. Database Schema (SQL)
To make the "Splitter" app fully functional with a backend, run this SQL in your Supabase **SQL Editor**:

```sql
-- Create Groups Table
create table groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  currency text default '$',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Members Table
create table members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade,
  name text not null,
  avatar text
);

-- Create Expenses Table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade,
  description text not null,
  amount numeric not null,
  paid_by uuid references members(id),
  category text,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3. Connect UI
Update `apps/splitter/SplitterApp.tsx` to use `supabase.from('expenses').select('*')` instead of local state.
