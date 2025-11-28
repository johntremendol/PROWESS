import { createClient } from '@supabase/supabase-js';

// Environment variables are preferred, but empty strings provided to avoid crash during initial setup
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || '';

// Export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
