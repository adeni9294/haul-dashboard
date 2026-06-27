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
  const [targetAnggaran, setTargetAnggaran] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const [pemasukanKategori, setPemasukanKategori] = useState([]);
  const [pengeluaranKategori, setPengeluaranKategori] = useState([]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('is_admin_haul') === 'true');
    setDate(new Date().toISOString().split('T')[0]);
    loadAllDashboardAndTrxData();
  }, []);

  async function loadAllDashboardAndTrxData() {
    if (!supabaseUrl || !supabaseKey) return;
    try {
      // 1. Load Settings (Pengumuman & Tema)
      const { data: configData } = await supabase.from('settings').select('*').eq('id', 'main_config');
      setAnnouncement('Selamat Datang di Sistem Informasi Keuangan Panitia Haul Maqbaroh Buyut Kepuh dan Buyut Besus.');
      if (configData && configData.length > 0 && configData[0].announcement) {
        setAnnouncement(configData[0].announcement);
      }

      // 2. Load Categories untuk Dropdown Form
      const { data: catData } = await supabase.from('categories').select('name').order('name');
      if (catData && catData.length > 0) {
        setCategories(catData);
        setCategory(catData[0].name);
      }

      // 3. Load Target Anggaran dari budgets
      const { data: budgetData } = await supabase.from('budgets').select('planned_amount');
      let totalTarget = 0;
      if (budgetData) budgetData.forEach(b => totalTarget += Number(b.planned_amount || 0));
      setTargetAnggaran(totalTarget);

      // 4. Load & Kalkulasi Transaksi Kas Buku Besar
      const { data: trxData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (trxData) {
        setTransactions(trxData);
        let mapMasuk = {};
        let mapKeluar = {};

        trxData.forEach(t => {
          const nominal = Number(t.amount || 0);
          const tipeKas = String(t.type || '').toLowerCase().trim();
          const katName = t.category || 'Umum';
          
          if (tipeKas === 'pemasukan' || tipeKas === 'masuk') {
            mapMasuk[katName] = (mapMasuk[katName] || 0) + nominal;
          } else if (tipeKas === 'pengeluaran' || tipeKas === 'keluar') {
            mapKeluar[katName] = (mapKeluar[katName] || 0) + nominal;
          }
        });

        setPemasukanKategori(Object.entries(mapMasuk).map(([category, amount]) => ({ category, amount })));
        setPengeluaranKategori(Object.entries(mapKeluar).map(([category, amount]) => ({ category, amount })));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const totalPemasukan = transactions.filter(t => String(t.type).toLowerCase() === 'pemasukan' || String(t.type).toLowerCase() === 'masuk').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPengeluaran = transactions.filter(t => String(t.type).toLowerCase() === 'pengeluaran' || String(t.type).toLowerCase() === 'keluar').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const sSaldoKas = totalPemasukan - totalPengeluaran;
  const progres = targetAnggaran > 0 ? Math.min(Math.round((totalPemasukan / targetAnggaran) * 100), 100) : 0;

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
        setEditingId(null);
      } else {
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
      }
      setAmount(''); setNote(''); setEditingId(null);
      await loadAllDashboardAndTrxData();
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

  return (
    <div className="space-y-6">
      {/* PENGUMUMAN */}
      {announcement && (
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">📢 Pengumuman Internal</h4>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{announcement}</p>
        </div>
      )}

      {/* KARTU RINGKASAN LIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">💰 Sisa Saldo Kas Utama</p>
          <h3 className="text-lg font-black text-white font-mono">Rp {sSaldoKas.toLocaleString('id-ID')}</h3>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">📈 Total Dana Masuk</p>
          <h3 className="text-lg font-bold text-emerald-400 font-mono">Rp {totalPemasukan.toLocaleString('id-ID')}</h3>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">📉 Total Dana Keluar</p>
          <h3 className="text-lg font-bold text-rose-400 font-mono">Rp {totalPengeluaran.toLocaleString('id-ID')}</h3>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">🎯 Progres Target</p>
            <span className="text-xs font-mono font-black text-amber-500">{progres}%</span>
          </div>
          <h3 className="text-lg font-bold text-white font-mono">Rp {targetAnggaran.toLocaleString('id-ID')}</h3>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${progres}%` }}></div>
          </div>
        </div>
      </div>

      {/* RINCIAN PENGELOMPOKKAN KATEGORI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📥 Rincian Pemasukan per Kategori</h3>
          {pemasukanKategori.map((pk, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl text-xs font-mono">
              <span className="text-slate-300">🏷️ {pk.category}</span>
              <span className="text-emerald-400 font-bold">Rp {pk.amount.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">📤 Rincian Pengeluaran per Kategori</h3>
          {pengeluaranKategori.map((pk, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-950/60 border border-slate-800/40 rounded-xl text-xs font-mono">
              <span className="text-slate-300">📦 {pk.category}</span>
              <span className="text-rose-400 font-bold">Rp {pk.amount.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* INPUT FORM & LOG TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdmin ? (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 h-fit shadow-xl">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">{editingId ? '🔄 Koreksi Transaksi' : '➕ Catat Mutasi Kas'}</h3>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
              <option value="pemasukan">📥 Pemasukan (Cash In)</option>
              <option value="pengeluaran">📤 Pengeluaran (Cash Out)</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none">
              {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
            </select>
            <input type="number" required placeholder="Nominal Rp..." value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono" />
            <input type="text" placeholder="Keterangan Catatan..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
            <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl">{editingId ? 'Perbarui Kas' : 'Simpan Kas'}</button>
          </form>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl h-fit text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">💡 Mode Publik (Lihat Saja).</p>
          </div>
        )}

        <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-300 uppercase">📋 Log Riwayat Jalur Transaksi ({transactions.length})</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                        <button type="button" onClick={() => handleEdit(t)} className="text-amber-500 font-bold">Edit</button>
                        <button type="button" onClick={async () => { if (confirm('Hapus transaksi ini?')) { await supabase.from('transactions').delete().eq('id', t.id); loadAllDashboardAndTrxData(); } }} className="text-rose-400 font-bold">Hapus</button>
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
