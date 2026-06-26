import { supabase } from './supabaseClient';

export default async function Home() {
  // Mengambil data dari 6 tabel
  const { data: data1 } = await supabase.from('bank_acoounts').select('*');
    const { data: data6 } = await supabase.from('transactions').select('*');
  const { data: data2 } = await supabase.from('budgets').select('*');
  const { data: data3 } = await supabase.from('categories').select('*');
  const { data: data4 } = await supabase.from('committee').select('*');
  const { data: data5 } = await supabase.from('settings').select('*');


  const allData = [
    { title: 'bank_acoounts', items: data1 },
    { title: 'transactions', items: data2 },
    { title: 'budgets', items: data3 },
    { title: 'categories', items: data4 },
    { title: 'committee', items: data5 },
    { title: 'settings', items: data6 },
  ];

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard Data</h1>
      {allData.map((tabel, index) => (
        <section key={index} className="mb-10">
          <h2 className="text-xl font-semibold mb-3">{tabel.title}</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre>{JSON.stringify(tabel.items, null, 2)}</pre>
          </div>
        </section>
      ))}
    </main>
  );
}