import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validasi tambahan agar aplikasi memberikan peringatan yang jelas jika .env lupa diisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'PENTING: Variabel NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi di file .env Anda!'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
