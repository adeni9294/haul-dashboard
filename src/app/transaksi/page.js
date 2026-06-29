'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransaksiPage() {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaOrg, setMetaOrg] = useState({ name: 'PANITIA HAUL', address: '' });

  // Filter & Form Input State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      
      // Ambil metadata KOP untuk cetak dokumen
      const { data: setDb } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (setDb && setDb.length > 0) {
        setMetaOrg({ name: setDb[0].org_name || 'PANITIA HAUL', address: setDb[0].address || '' });
      }

      const { data: catDb } = await supabase.from('categories').select('*');
      if (catDb) setCategories(catDb);

      const { data: transDb } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
      if (transDb) setAllTransactions(transDb);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  // Pengelompokan Kategori untuk Dokumen LPJ Formal
  const lpjMasuk = {}; const lpjKeluar = {};
  let totalLpjMasuk = 0; let totalLpjKeluar = 0;

  allTransactions.forEach(item => {
    const nominal = parseFloat(item.amount || item.nominal) || 0;
    const type = (item.type || '').toLowerCase().trim();
    const cat = item.category || 'Lain-lain';

    if (type === 'masuk') {
      totalLpjMasuk += nominal;
      if (!lpjMasuk[cat]) lpjMasuk[cat] = [];
      lpjMasuk[cat].push(item);
    } else {
      totalLpjKeluar += nominal;
      if (!lpjKeluar[cat]) lpjKeluar[cat] = [];
      lpjKeluar[cat].push(item);
    }
  });

  const triggerCetakLpj = () => { window.print(); };
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Filter data untuk preview di layar browser biasa
  const filteredTrans = allTransactions.filter(t => {
    const matchSearch = (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Memuat Manajer Kas Buku Besar...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 text-xs">
      
      {/* ================= AREA ELEMEN LAYAR UTAMA (TIDAK IKUT DICETAK) ================= */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">💰 Manajer Buku Kas Transaksi</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Total data: {allTransactions.length} baris riwayat kas</p>
          </div>
          {/* Tombol Cetak Dokumen LPJ */}
          <button onClick={triggerCetakLpj} className="px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all shadow-md">
            🖨️ Cetak Dokumen LPJ (PDF)
          </button>
        </div>

        {/* Panel Filter Navigasi Layar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800/60 p-3 rounded-xl">
          <input type="text" placeholder="Cari keterangan..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white">
            <option value="all">Semua Jenis Alur</option>
            <option value="masuk">🟢 Hanya Kas Masuk</option>
            <option value="keluar">🔴 Hanya Kas Keluar</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white">
            <option value="all">Semua Kategori Pos</option>
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Tabel Preview di Layar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                <th className="p-3">Tanggal</th><th className="p-3">Kategori</th><th className="p-3">Keterangan</th><th className="p-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200 font-medium">
              {filteredTrans.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20">
                  <td className="p-3 font-mono text-slate-400">{t.transaction_date}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-950 rounded border border-white/5 text-[10px] uppercase font-mono">{t.category}</span></td>
                  <td className="p-3 truncate max-w-xs">{t.description}</td>
                  <td className={`p-3 text-right font-mono font-bold ${t.type === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* ================= AREA STRUKTUR STRUK LPJ FORMAL A4 (HANYA MUNCUL SAAT DI-PRINT) ================= */}
      <div className="hidden print:block bg-white text-black p-8 font-serif leading-relaxed text-xs">
        
        {/* KOP SURAT FORMAL */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6 space-y-1">
          <h1 className="text-lg font-bold uppercase font-sans tracking-wide">{metaOrg.name}</h1>
          <p className="text-[10px] font-sans italic text-gray-600">{metaOrg.address}</p>
          <h2 className="text-xs font-bold uppercase pt-3 font-sans underline tracking-widest">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN KAS</h2>
        </div>

        {/* RINGKASAN SALDO BUKU BESAR */}
        <div className="grid grid-cols-3 gap-2 font-sans border border-black p-3 rounded mb-6 text-[10px]">
          <div><p className="text-gray-500 uppercase font-bold">Total Pemasukan</p><p className="text-sm font-bold text-green-700">{formatRupiah(totalLpjMasuk)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Total Pengeluaran</p><p className="text-sm font-bold text-red-700">{formatRupiah(totalLpjKeluar)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Sisa Kas Bersih</p><p className="text-sm font-bold text-blue-800 underline">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</p></div>
        </div>

        {/* RINCIAN MASUK BY KATEGORI */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold uppercase text-xs border-b border-black pb-1 text-green-800">🟢 RINCIAN REALISASI PEMASUKAN</h3>
          {Object.keys(lpjMasuk).map((catName, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="font-sans font-bold text-[11px] text-gray-700 uppercase pl-1 bg-gray-100">Pos Kategori: {catName}</h4>
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-gray-400 font-bold italic text-gray-600"><th className="py-1 w-24">Tanggal</th><th className="py-1">Uraian Keterangan</th><th className="py-1 text-right w-36">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lpjMasuk[catName].map((t, i) => (
                    <tr key={i}><td className="py-1 font-mono">{t.transaction_date}</td><td className="py-1">{t.description}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* RINCIAN KELUAR BY KATEGORI */}
        <div className="space-y-4 pt-6">
          <h3 className="font-sans font-bold uppercase text-xs border-b border-black pb-1 text-red-800">🔴 RINCIAN REALISASI PENGELUARAN</h3>
          {Object.keys(lpjKeluar).map((catName, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="font-sans font-bold text-[11px] text-gray-700 uppercase pl-1 bg-gray-100">Pos Kategori: {catName}</h4>
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-gray-400 font-bold italic text-gray-600"><th className="py-1 w-24">Tanggal</th><th className="py-1">Uraian Keterangan</th><th className="py-1 text-right w-36">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lpjKeluar[catName].map((t, i) => (
                    <tr key={i}><td className="py-1 font-mono">{t.transaction_date}</td><td className="py-1">{t.description}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* KOLOM TANDA TANGAN FORMAL */}
        <div className="mt-12 grid grid-cols-2 text-center font-sans text-[10px] pt-12">
          <div className="space-y-14">
            <p>Mengetahui,<br /><b className="uppercase">Ketua Panitia Haul</b></p>
            <p className="underline font-bold">( ........................................ )</p>
          </div>
          <div className="space-y-14">
            <p>Cirebon, {new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}<br /><b className="uppercase">Bendahara Umum</b></p>
            <p className="underline font-bold">( ........................................ )</p>
          </div>
        </div>

      </div>

    </div>
  );
}
