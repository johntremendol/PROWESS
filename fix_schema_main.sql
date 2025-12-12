-- Fix Schema for Main Branch
-- The 'main' branch includes multi-payer support features which require JSONB columns.

-- 1. Drop the Foreign Key constraint on paid_by
alter table public.expenses drop constraint if exists expenses_paid_by_fkey;

-- 2. Ensure 'split_between' exists
alter table public.expenses add column if not exists split_between jsonb;

-- 3. Ensure 'paid_by' is JSONB
-- CASTING FIX: We use to_jsonb() to safely convert the UUID string into a JSON string.
-- Direct casting (::jsonb) expects valid JSON syntax (quoted strings), which raw UUIDs are not.
alter table public.expenses alter column paid_by type jsonb using to_jsonb(paid_by::text);
