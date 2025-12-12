-- Fix Schema for Main Branch
-- The 'main' branch includes multi-payer support features which require JSONB columns.

-- 1. Drop the Foreign Key constraint on paid_by (because we are changing it to JSONB)
-- This constraint prevents changing the type from UUID. 
-- Since we now store custom JSON objects (multi-payer), we can't enforce a simple FK to a single member ID.
alter table public.expenses drop constraint if exists expenses_paid_by_fkey;

-- 2. Ensure 'split_between' exists
alter table public.expenses add column if not exists split_between jsonb;

-- 3. Ensure 'paid_by' is JSONB
-- CASTing: We convert to text first, then jsonb.
-- If existing data is a UUID string, it becomes a JSON string "uuid".
-- The app logic handles both string (legacy) and object (new) formats.
alter table public.expenses alter column paid_by type jsonb using paid_by::text::jsonb;
