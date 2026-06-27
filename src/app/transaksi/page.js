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
  const [date, setDate] = useState(''); // State Baru untuk Tanggal
  const [editingId, setEditingId] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Set default tanggal hari ini saat halaman dimuat
    const hariIni = new Date().toISOString().split('T')[0];
    setDate(hariIni);
    loadData();
  }, []);

  async function loadData() {
    const { data: trx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (trx) setTransactions(trx);
    const { data: cat } = await supabase.from('categories').select('name').order('name');
    if (cat && cat.length > 0) {
      setCategories(cat);
      if (!category) setCategory(cat[0].name);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Payload menyertakan created_at kustom dari input tanggal
    const payload = { 
      type, 
      category, 
      amount: Number(amount), 
      description: note,
      created_at: date ? new Date(date).toISOString() : new Date().toISOString()
    };
    
    try {
      if (editingId) {
        // Logika UPDATE berfungsi penuh
        const { error } = await supabase.from('transactions').update(payload).eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
        alert('Data transaksi berhasil diperbarui!');
      } else {
        // Logika INSERT data baru
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
        alert('Data transaksi berhasil ditambahkan!');
      }
      
      setAmount('');
      setNote('');
      const hariIni = new Date().toISOString().split('T')[0];
      setDate(hariIni);
      loadData();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setType(item.type);
    setCategory(item.category);
    setAmount(item.amount);
    setNote(item.description || item.note || '');
    if (item.created_at) {
      setDate(new Date(item.created_at).toISOString().split('T')[0]);
    }
    // Scroll otomatis ke atas agar form terlihat di HP
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus mutasi kas ini secara permanen?')) {
      await supabase.from('transactions').delete().eq('id', id);
      loadData();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORM INPUT TRANSAKSI */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 h-fit shadow-xl">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">
          {editingId ? '🔄 Mode Edit Transaksi' : '➕ Catat Mutasi Kas'}
        </h3>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Tanggal Transaksi</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Jenis Kas</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
            <option value="pemasukan">📥 Pemasukan (Cash In)</option>
            <option value="pengeluaran">📤 Pengeluaran (Cash Out)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Pilih Kategori Pos</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Nominal Angka (Rp)</label>
          <input type="number" required placeholder="Contoh: 150000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Keterangan Catatan</label>
          <input type="text" placeholder="Contoh: Hamba Allah Blok Manis" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all">
          {editingId ? '💾 Perbarui Transaksi' : '💾 Simpan Transaksi'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setAmount(''); setNote(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Batal Edit</button>
        )}
      </form>

      {/* RECODS TABEL */}
      <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Log Alur Pembukuan Buku Besar</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {transactions.map((t) => (
            <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-200">{t.category} <span className="text-[10px] text-slate-500 font-mono">({t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-'})</span></p>
                <p className="text-slate-400 text-[11px] mt-0.5">📝 {t.description || t.note || '-'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold mr-2 ${t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'pemasukan' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
                <button onClick={() => handleEdit(t)} className="text-amber-500 font-black hover:text-amber-400">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-rose-400 font-black hover:text-rose-300">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
