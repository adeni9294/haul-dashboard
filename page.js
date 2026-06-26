import { supabase } from './supabaseClient';

export default async function Home() {
  // Mengambil data
  const { data, error } = await supabase
    .from('nama_tabel_anda') 
    .select('*');

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Data Haul Dashboard</h1>
      <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </main>
  );
}