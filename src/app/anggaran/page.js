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
    const { data, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    if (!error && data) setBudgets(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !plannedAmount) return;

    // Gunakan penampung ID lokal agar tidak terpengaruh re-render state mid-flight
    const currentEditingId = editingId;

    const payload = { 
      item_name: itemName.trim(), 
      planned_amount: Number(plannedAmount)
    };

    try {
      if (currentEditingId) {
        // Mode KOREKSI DATA (UPDATE) - Tanpa menyertakan created_at baru
        const { error } = await supabase.from('budgets').update(payload).eq('id', currentEditingId);
        if (error) throw error;
        alert('Rencana anggaran berhasil diperbarui!');
      } else {
        // Mode BUAT BARU (INSERT) - Menyertakan created_at agar lolos NOT NULL constraint
        const insertPayload = { ...payload, created_at: new Date().toISOString() };
        const { error } = await supabase.from('budgets').insert([insertPayload]);
        if (error) throw error;
        alert('Rencana anggaran berhasil ditambahkan!');
      }

      // Reset form secara aman
      setItemName(''); 
      setPlannedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) { 
      alert(`Gagal menyimpan data anggaran: ${err.message}`); 
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setItemName(b.item_name);
    setPlannedAmount(b.planned_amount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus anggaran ini secara permanen?')) {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (!error) await loadBudgets();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase">
          {editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Target Anggaran'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Keperluan Pos</label>
          <input type="text" placeholder="Contoh: Konsumsi Acara" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nominal Alokasi (Rp)</label>
          <input type="number" placeholder="Contoh: 5000000" required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
        </div>
        <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
          {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setItemName(''); setPlannedAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Batal Edit</button>
        )}
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Daftar Distribusi Plafon Anggaran ({budgets.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {budgets.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada data anggaran yang tersimpan.</p>
          ) : (
            budgets.map(b => (
              <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span>💡 {b.item_name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-500">Rp {Number(b.planned_amount).toLocaleString('id-ID')}</span>
                  <button type="button" onClick={() => handleEdit(b)} className="text-amber-500 hover:underline font-bold">Edit</button>
                  <button type="button" onClick={() => handleDelete(b.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
