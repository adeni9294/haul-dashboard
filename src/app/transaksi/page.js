'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('pemasukan');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: trx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (trx) setTransactions(trx);
    const { data: cat } = await supabase.from('categories').select('name');
    if (cat && cat.length > 0) {
      setCategories(cat);
      setCategory(cat[0].name);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { type, category, amount: Number(amount), description: note };
    
    if (editingId) {
      await supabase.from('transactions').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('transactions').insert([payload]);
    }
    
    setAmount('');
    setNote('');
    loadData();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setType(item.type);
    setCategory(item.category);
    setAmount(item.amount);
    setNote(item.description || item.note || '');
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus mutasi kas ini secara permanen?')) {
      await supabase.from('transactions').delete().eq('id', id);
      loadData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 h-fit">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">{editingId ? '🔄 Mode Koreksi Kas' : '➕ Catat Mutasi Kas'}</h3>
        <div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
            <option value="pemasukan">📥 Pemasukan</option>
            <option value="pengeluaran">📤 Pengeluaran</option>
          </select>
        </div>
        <div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <input type="number" required placeholder="Nominal Angka..." value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <div>
          <input type="text" placeholder="Keterangan Catatan..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs uppercase rounded-xl">Simpan</button>
      </form>

      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Log Alur Pembukuan</h3>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold">{t.category} <span className="text-[10px] text-slate-500">({t.type})</span></p>
                <p className="text-slate-400 text-[11px]">{t.description || t.note || '-'}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono font-bold ${t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
                <button onClick={() => handleEdit(t)} className="text-amber-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-rose-400 hover:underline">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
