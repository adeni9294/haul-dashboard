'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// SINGLETON: Menginisialisasi satu client Supabase agar tidak memicu error multiple instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TransaksiPage() {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true); // Bypass login admin sementara untuk pengetesan langsung
  const [metaOrg, setMetaOrg] = useState({ name: 'PANITIA HAUL', address: '' });

  // State Form Modal Utama
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState('Pemasukan');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');

  // Filter List State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      const { data: setDb } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (setDb && setDb.length > 0) {
        setMetaOrg({ name: setDb[0].org_name || 'PANITIA HAUL', address: setDb[0].address || '' });
      }

      // 1. Ambil Kategori dari tabel 'category'
      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        setCategories(catDb);
        setFormCategory(catDb[0].name); // 🟢 Mencegah value category kosong saat form Tambah dibuka pertama kali
      } else {
        // Fallback jika tabel kategori kosong di database Anda
        const defaultCats = [{ name: 'Kas Umum' }, { name: 'Administrasi' }];
        setCategories(defaultCats);
        setFormCategory(defaultCats[0].name);
      }

      // 2. Ambil Transaksi dari tabel 'transactions'
      const { data: transDb } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      if (transDb) setAllTransactions(transDb);
    } catch (e) {
      console.error("Gagal load data: ", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    
    // 🟢 VALIDASI DAN BERSIHKAN NOMINAL ANGKA (Mutlak untuk kolom numeric Supabase)
    const cleanAmount = parseFloat(formAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    
    if (cleanAmount <= 0) {
      alert('❌ Nominal angka bersih tidak boleh kosong atau 0!');
      return;
    }

    // Pastikan kategori memiliki nilai dan tidak mengirim string kosong
    const finalCategory = formCategory || (categories.length > 0 ? categories[0].name : 'Lain-lain');

    const payload = {
      transaction_date: formDate,
      type: formType,
      category: finalCategory,
      note: formDescription.trim(), // Mengarah ke kolom 'note' database
      amount: cleanAmount          // Mengarah ke kolom 'amount' tipe numeric
    };

    try {
      if (isEditMode) {
        // Mode Update
        const { error } = await supabase.from('transactions').update(payload).eq('id', selectedId);
        if (error) throw error;
        alert('🟢 Sukses: Perubahan data transaksi berhasil disimpan!');
      } else {
        // Mode Insert Tambah Baru
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
        alert('🟢 Sukses: Catatan transaksi baru berhasil ditambahkan!');
      }
      resetForm();
      await loadData();
    } catch (err) {
      alert(`❌ Error Supabase:\n${err.message || JSON.stringify(err)}`);
    }
  };

  const triggerEdit = (item) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormDate(item.transaction_date || new Date().toISOString().split('T')[0]);
    
    const currentType = (item.type || '').toString().toLowerCase().trim();
    setFormType(currentType === 'masuk' || currentType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran');
    
    setFormCategory(item.category || (categories.length > 0 ? categories[0].name : ''));
    setFormDescription(item.note || '');
    setFormAmount(item.amount || ''); // Memuat angka mentah asli tanpa format rupiah agar bisa di-edit
    setShowModal(true);
  };

  const triggerHapus = async (id) => {
    if (!confirm('Hapus permanen catatan transaksi ini?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      alert('🗑️ Catatan berhasil dihapus dari database.');
      await loadData();
    } catch (err) {
      alert(`❌ Gagal hapus: ${err.message}`);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormType('Pemasukan');
    if (categories.length > 0) {
      setFormCategory(categories[0].name);
    } else {
      setFormCategory('');
    }
    setFormDescription('');
    setFormAmount('');
    setShowModal(false);
  };

  // Kalkulasi Cetak LPJ Dokumentasi
  const lpjMasuk = {}; const lpjKeluar = {};
  let totalLpjMasuk = 0; let totalLpjKeluar = 0;

  allTransactions.forEach(item => {
    const nominal = parseFloat(item.amount) || 0;
    const type = (item.type || '').toString().toLowerCase().trim();
    const cat = item.category || 'Lain-lain';

    if (type === 'masuk' || type === 'pemasukan') {
      totalLpjMasuk += nominal;
      if (!lpjMasuk[cat]) lpjMasuk[cat] = [];
      lpjMasuk[cat].push(item);
    } else {
      totalLpjKeluar += nominal;
      if (!lpjKeluar[cat]) lpjKeluar[cat] = [];
      lpjKeluar[cat].push(item);
    }
  });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const filteredTrans = allTransactions.filter(t => {
    const txt = (t.note || '').toLowerCase();
    const matchSearch = txt.includes(search.toLowerCase());
    
    const currentType = (t.type || '').toLowerCase();
    let matchType = false;
    if (typeFilter === 'all') matchType = true;
    else if (typeFilter === 'masuk') matchType = (currentType === 'masuk' || currentType === 'pemasukan');
    else if (typeFilter === 'keluar') matchType = (currentType === 'keluar' || currentType === 'pengeluaran');

    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Sinkronisasi database kas pertanggungjawaban...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* HEADER PANEL KONTROL */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider">💰 Buku Kas & Transaksi Haul</h2>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Sistem Terkoneksi (Mode Administrator)</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 text-white font-bold uppercase rounded-xl hover:bg-emerald-500 transition-all shadow-md">
              ➕ Tambah Kas
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all shadow-md">
              🖨️ Cetak LPJ
            </button>
          </div>
        </div>

        {/* Filter Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800/60 p-3 rounded-xl">
          <input type="text" placeholder="Cari uraian keterangan..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">Semua Aliran Kas</option>
            <option value="masuk">🟢 Hanya Kas Masuk</option>
            <option value="keluar">🔴 Hanya Kas Keluar</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">Semua Kategori Pos</option>
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Tabel Utama */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[9px] tracking-wider">
                <th className="p-3">Tanggal</th>
                <th className="p-3">Pos Kategori</th>
                <th className="p-3">Uraian Keterangan</th>
                <th className="p-3 text-right">Nominal Angka</th>
                <th className="p-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              {filteredTrans.map((t, idx) => {
                const currentType = (t.type || '').toString().toLowerCase();
                const isPemasukan = currentType === 'masuk' || currentType === 'pemasukan';
                
                return (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-3 font-mono text-slate-500">{t.transaction_date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded font-mono text-[9px] uppercase ${isPemasukan ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3 truncate max-w-xs font-medium">{t.note}</td>
                    <td className={`p-3 text-right font-mono font-black ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPemasukan ? '+' : '-'}{formatRupiah(t.amount)}
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button type="button" onClick={() => triggerEdit(t)} className="text-amber-400 hover:underline font-bold">Edit</button>
                      <button type="button" onClick={() => triggerHapus(t.id)} className="text-rose-400 hover:underline font-bold">Hapus</button>
                    </td>
                  </tr>
                );
              })}
              {filteredTrans.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500 font-mono">Tidak ada catatan transaksi ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG FORM MODAL: EDIT DAN TAMBAH KAS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTransaction} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              {isEditMode ? '📝 Modifikasi Catatan Kas' : '➕ Registrasi Catatan Baru'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Tanggal</label>
                <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-center font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Aliran Jenis</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none">
                  <option value="Pemasukan">🟢 Pemasukan (Hijau)</option>
                  <option value="Pengeluaran">🔴 Pengeluaran (Merah)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Kategori Pos Buku Kas</label>
              <select required value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none">
                {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nominal Rupiah (Hanya Angka Murni)</label>
              <input type="number" placeholder="Contoh: 1200000" required value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-right font-bold text-amber-400 text-sm" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Uraian Deskripsi / Keterangan Pembayar</label>
              <textarea rows="3" placeholder="Tulis deskripsi detail..." required value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black uppercase rounded-xl shadow-lg">Simpan Data</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT AREA LAYOUT */}
      <div className="hidden print:block bg-white text-black p-10 font-serif text-xs">
        <div className="text-center border-b-4 border-double border-black pb-3 mb-6">
          <h1 className="text-base font-bold uppercase font-sans">{metaOrg.name}</h1>
          <p className="text-[9px] font-sans italic text-gray-500">{metaOrg.address}</p>
          <h2 className="text-xs font-bold uppercase pt-3 font-sans underline tracking-widest">LAPORAN KEUANGAN HAUL REAL-TIME</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 font-sans border border-black p-3 rounded mb-6 text-[10px] bg-gray-50">
          <div><p className="text-gray-500 uppercase font-bold">Total Penerimaan</p><p className="text-xs font-black text-green-700">{formatRupiah(totalLpjMasuk)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Total Pengeluaran</p><p className="text-xs font-black text-red-700">{formatRupiah(totalLpjKeluar)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Sisa Saldo Kas</p><p className="text-xs font-black text-blue-800 underline">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</p></div>
        </div>

        {/* Realisasi Kas Masuk */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold uppercase text-[10px] border-b border-black pb-0.5 text-green-800">1. REALISASI KAS MASUK</h3>
          {Object.keys(lpjMasuk).map((cat, i) => (
            <div key={i} className="space-y-1">
              <h4 className="font-sans font-bold text-[10px] text-gray-700 bg-gray-100 pl-1 uppercase">Pos: {cat}</h4>
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-gray-400 italic text-gray-500"><th className="py-1 w-20">Tanggal</th><th>Keterangan</th><th className="py-1 text-right w-28">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lpjMasuk[cat].map((t, idx) => (
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td>{t.note}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Realisasi Kas Keluar */}
        <div className="space-y-4 pt-6">
          <h3 className="font-sans font-bold uppercase text-[10px] border-b border-black pb-0.5 text-red-800">2. REALISASI KAS KELUAR</h3>
          {Object.keys(lpjKeluar).map((cat, i) => (
            <div key={i} className="space-y-1">
              <h4 className="font-sans font-bold text-[10px] text-gray-700 bg-gray-100 pl-1 uppercase">Pos: {cat}</h4>
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-gray-400 italic text-gray-500"><th className="py-1 w-20">Tanggal</th><th>Uraian Keperluan</th><th className="py-1 text-right w-28">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lpjKeluar[cat].map((t, idx) => (
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td>{t.note}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
