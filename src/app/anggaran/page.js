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

  useEffect(() => { 
    loadBudgets(); 
  }, []);

  async function loadBudgets() {
    try {
      const { data, error } = await supabase.from('budgets').select('*');
      if (!error && data) {
        setBudgets(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !plannedAmount) return;

    const payload = { item_name: itemName.trim(), planned_amount: Number(plannedAmount) };

    if (editingId) {
      await supabase.from('budgets').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('budgets').insert([payload]);
    }

    setItemName('');
    setPlannedAmount('');
    loadBudgets();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setItemName(item.item_name);
    setPlannedAmount(item.planned_amount);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus anggaran ini?')) {
      await supabase.from('budgets').delete().eq('id', id);
      loadBudgets();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4">
        <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Edit Rencana' : '➕ Tambah Target Anggaran'}</h3>
        <input type="text" placeholder="Nama Keperluan Pos..." required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        <input type="number" placeholder="Nominal Alokasi Dana..." required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl">Simpan Anggaran</button>
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Daftar Distribusi Plafon Anggaran</h3>
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 font-mono">Tidak ada data anggaran ditemukan.</p>
        ) : (
          budgets.map(b => (
            <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <span>💡 {b.item_name}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-amber-500">Rp {Number(b.planned_amount).toLocaleString('id-ID')}</span>
                <button onClick={() => handleEdit(b)} className="text-amber-500 hover:underline font-bold">Edit</button>
                <button onClick={() => handleDelete(b.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
