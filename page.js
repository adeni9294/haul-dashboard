import { createClient } from '@supabase/supabase-js';

// Gunakan variabel lingkungan yang sudah Anda set di Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function Home() {
  // Kita coba ambil data dari 1 tabel saja dulu untuk tes
  // Ganti 'nama_tabel_anda' dengan nama salah satu tabel Anda yang sudah di-set SELECT policy-nya
  const { data, error } = await supabase.from('settings').select('*');

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Haul Dashboard</h1>
      
      {error ? (
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}