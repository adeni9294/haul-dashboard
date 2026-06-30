import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Satu client untuk semua halaman (Transaksi, Dokumentasi, Anggaran, dll.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
