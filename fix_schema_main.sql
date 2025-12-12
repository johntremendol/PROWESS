-- Fix Schema for Main Branch
-- The 'main' branch includes multi-payer support features which require JSONB columns.

-- 1. Ensure 'split_between' exists
alter table public.expenses add column if not exists split_between jsonb;

-- 2. Ensure 'paid_by' is JSONB (to support multi-payer objects)
-- If it's currently text or uuid, this converts it. 
-- NOTE: If basic casting fails, you might need to handle specific data conversion manually.
alter table public.expenses alter column paid_by type jsonb using paid_by::text::jsonb;
