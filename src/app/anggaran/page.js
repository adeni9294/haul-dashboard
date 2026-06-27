'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState([]);
  const [itemName, setItemName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { 
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    loadBudgets(); 
  }, []);

  async function loadBudgets() {
    const { data, error } = await supabase.from('budgets').select('*').order('id', { ascending: false });
    if (!error && data) setBudgets(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!itemName.trim() || !plannedAmount) return;

    const payload = { 
      item_name: itemName.trim(), 
      planned_amount: parseInt(plannedAmount, 10) 
    };

    try {
      if (editingId) {
        // Tambahkan .select() untuk memastikan data berhasil di-update tanpa memicu RLS bisu
        const { error, data } = await supabase
          .from('budgets')
          .update(payload)
          .eq('id', editingId)
          .select();
        
        if (error) throw error;
        alert('Rencana anggaran berhasil diperbarui!');
      } else {
        const { error, data } = await supabase
          .from('budgets')
          .insert([payload])
          .select();
          
        if (error) throw error;
        alert('Rencana anggaran berhasil ditambahkan!');
      }

      setItemName(''); 
      setPlannedAmount('');
      setEditingId(null);
      await loadBudgets();
    } catch (err) { 
      console.error(err);
      // Membuka pesan detail error dari Supabase jika ada objek mendalam
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Gagal menyimpan anggaran: ${errorMsg}\n\nTips: Pastikan kebijakan RLS (Row Level Security) untuk INSERT/UPDATE pada tabel "budgets" di Supabase sudah di-enable.`); 
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setItemName(b.item_name || '');
    setPlannedAmount(b.planned_amount || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (confirm('Hapus anggaran ini?')) {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (!error) await loadBudgets();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {isAdmin ? (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-amber-500 uppercase">{editingId ? '🔄 Perbarui Anggaran' : '➕ Tambah Target Anggaran'}</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nama Keperluan Pos</label>
            <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Nominal Alokasi (Rp)</label>
            <input type="number" required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
          </div>
          <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 transition-all">
            {editingId ? '💾 Simpan Perubahan' : 'Simpan Anggaran'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setItemName(''); setPlannedAmount(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl mt-2">Batal Edit</button>
          )}
        </form>
      ) : (
        <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl h-fit text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">💡 Mode Publik (Lihat Saja).</p>
        </div>
      )}

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Plafon Anggaran ({budgets.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {budgets.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">Belum ada data anggaran.</p>
          ) : (
            budgets.map(b => (
              <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span>💡 {b.item_name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-500">Rp {Number(b.planned_amount || 0).toLocaleString('id-ID')}</span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(b)} className="text-amber-500 font-bold hover:underline">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
