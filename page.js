import { supabase } from './supabaseClient';

export default async function Home() {
  // Mengambil data dari tabel 'categories'
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*');

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">Data Kategori</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      )}
    </main>
  );
}