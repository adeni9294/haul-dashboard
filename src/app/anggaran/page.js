'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState([]);
  const [itemName, setItemName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { loadBudgets(); }, []);

  async function loadBudgets() {
    const { data } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    if (data) setBudgets(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !plannedAmount) return;
    const payload = { item_name: itemName.trim(), planned_amount: Number(plannedAmount) };

    try {
      if (editingId) {
        await supabase.from('budgets').update(payload).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('budgets').insert([payload]);
      }
      setItemName(''); setPlannedAmount('');
      loadBudgets();
      alert('Anggaran sukses diperbarui!');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Target Anggaran'}</h3>
        <input type="text" placeholder="Nama Keperluan Pos..." required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        <input type="number" placeholder="Nominal Alokasi..." required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl">Simpan Anggaran</button>
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Daftar Distribusi Plafon Anggaran</h3>
        {budgets.map(b => (
          <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
            <span>💡 {b.item_name}</span>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-amber-500">Rp {Number(b.planned_amount).toLocaleString('id-ID')}</span>
              <button type="button" onClick={() => { setEditingId(b.id); setItemName(b.item_name); setPlannedAmount(b.planned_amount); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-amber-500 font-bold">Edit</button>
              <button type="button" onClick={async () => { if (confirm('Hapus anggaran ini?')) { await supabase.from('budgets').delete().eq('id', b.id); loadBudgets(); } }} className="text-rose-400 font-bold">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
