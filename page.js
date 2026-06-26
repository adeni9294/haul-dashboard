import { supabase } from './supabaseClient';

export default async function Home() {
  const { data, error } = await supabase.from('categories').select('*');
  return (
    <main>
      <h1>Haul Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}