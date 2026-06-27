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
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    setDate(new Date().toISOString().split('T')[0]);
    loadData();
  }, []);

  async function loadData() {
    const { data: trx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (trx) setTransactions(trx);
    const { data: cat } = await supabase.from('categories').select('name').order('name');
    if (cat && cat.length > 0) {
      setCategories(cat);
      setCategory(cat[0].name);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('Aksi ditolak. Anda bukan admin!');
    if (!amount || !category) return;

    const currentEditingId = editingId;
    const payload = {
      type,
      category,
      amount: Number(amount),
      description: note.trim(),
      created_at: date ? new Date(date).toISOString() : new Date().toISOString()
    };

    try {
      if (currentEditingId) {
        const { error } = await supabase.from('transactions').update(payload).eq('id', currentEditingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
      }
      setAmount(''); setNote(''); setEditingId(null);
      await loadData();
      alert('Data transaksi buku besar sukses disimpan!');
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setType(t.type === 'pemasukan' || t.type === 'masuk' ? 'pemasukan' : 'pengeluaran');
    setCategory(t.category);
    setAmount(t.amount);
    setNote(t.description || t.note || '');
    if (t.created_at) setDate(new Date(t.created_at).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (confirm('Hapus transaksi ini?')) {
      await supabase.from('transactions').delete().eq('id', id);
      await loadData();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">💰 Jurnal Mutasi & Buku Kas</h2>
        <p className="text-xs text-slate-400">Kelola entri data finansial, pembukuan donasi, iuran warga, dan pengeluaran operasional.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 h-fit shadow-xl">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">{editingId ? '🔄 Koreksi Transaksi' : '➕ Catat Mutasi Kas'}</h3>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tanggal Transaksi</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Jenis Kas Arus</label>
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
              <label className="block text-[11px] text-slate-400 mb-1">Nominal Rupiah (Rp)</label>
              <input type="number" required placeholder="Contoh: 150000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Keterangan Catatan Tambahan</label>
              <input type="text" placeholder="Catatan ringkas..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md transition-all">
              {editingId ? '💾 Perbarui Kas' : 'Simpan Kas'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setAmount(''); setNote(''); }} className="w-full py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Batal Edit</button>
            )}
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">💡 Mode Publik (Lihat Saja).</p>
            <p className="text-[10px] text-slate-600">Form pengisian mutasi kas dikunci. Hubungi admin atau klik "Login Admin" di kanan atas layar untuk memodifikasi laporan pembukuan ini.</p>
          </div>
        )}

        <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Log Jurnal Arus Kas Seluruh Keuangan ({transactions.length})</h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {transactions.map((t) => {
              const checkMasuk = String(t.type).toLowerCase() === 'pemasukan' || String(t.type).toLowerCase() === 'masuk';
              return (
                <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{t.category} <span className="text-[10px] text-slate-500 font-mono">({t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-'})</span></p>
                    <p className="text-slate-400 text-[11px] mt-0.5">📝 {t.description || t.note || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold mr-2 ${checkMasuk ? 'text-emerald-400' : 'text-rose-400'}`}>{checkMasuk ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}</span>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(t)} className="text-amber-500 font-bold hover:underline">Edit</button>
                        <button type="button" onClick={() => handleDelete(t.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
