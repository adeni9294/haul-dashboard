'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState([]);
  const [itemName, setItemName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => { 
    loadBudgets(); 
  }, []);

  async function loadBudgets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setBudgets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !plannedAmount) return;

    const payload = { 
      item_name: itemName.trim(), 
      planned_amount: Number(plannedAmount) 
    };

    try {
      if (editingId) {
        await supabase.from('budgets').update(payload).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('budgets').insert([payload]);
      }
      setItemName('');
      setPlannedAmount('');
      loadBudgets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setItemName(item.item_name);
    setPlannedAmount(item.planned_amount);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus mata alokasi anggaran ini secara permanen?')) {
      try {
        await supabase.from('budgets').delete().eq('id', id);
        loadBudgets();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-xs font-mono text-slate-400 animate-pulse">⏳ Sinkronisasi alokasi anggaran panitia...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORM INPUT ANGGARAN */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl h-fit space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">
          {editingId ? '🔄 Koreksi Anggaran' : '➕ Tambah Target Anggaran'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nama Keperluan Pos</label>
          <input 
            type="text" 
            placeholder="Contoh: Konsumsi Pengunjung" 
            required 
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nominal Plafon Dana (Rp)</label>
          <input 
            type="number" 
            placeholder="Contoh: 5000000" 
            required 
            value={plannedAmount} 
            onChange={(e) => setPlannedAmount(e.target.value)} 
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" 
          />
        </div>
        <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all">
          💾 Simpan Anggaran
        </button>
      </form>

      {/* DAFTAR DISTRIBUSI ANGGARAN */}
      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Daftar Distribusi Plafon Anggaran</h3>
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-6">Belum ada alokasi rencana anggaran.</p>
        ) : (
          <div className="space-y-2">
            {budgets.map(b => (
              <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200">💡 {b.item_name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-500">
                    Rp {Number(b.planned_amount).toLocaleString('id-ID')}
                  </span>
                  <button onClick={() => handleEdit(b)} className="text-amber-500 font-bold hover:underline">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
