import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function Home() {
  // Mengambil data dari tabel (Ganti 'nama_tabel_anda' dengan salah satu dari 6 tabel Anda)
  const { data, error } = await supabase.from('transactions').select('*');

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">Haul Dashboard</h1>
      <div className="bg-gray-900 text-white p-4 rounded overflow-auto">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
    </main>
  );
}