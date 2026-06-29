'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TransaksiPage() {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaOrg, setMetaOrg] = useState({ name: 'PANITIA HAUL', address: '' });

  // Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      
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

  // Pengelompokan Data LPJ
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

  const filteredTrans = allTransactions.filter(t => {
    const matchSearch = (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Membuka lembar kendali kas...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 text-xs text-white">
      
      {/* AREA LAYAR UTAMA (TERSEMBUNYI SAAT PRINT) */}
      <div className="print:hidden space-y-4">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider">📋 Audit Buku Besar Transaksi (Read-Only)</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Seluruh fungsi input/modifikasi dinonaktifkan demi integritas data.</p>
          </div>
          <button onClick={triggerCetakLpj} className="px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all shadow-lg">
            🖨️ Unduh Berkas LPJ (PDF)
          </button>
        </div>

        {/* Panel Pencarian & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800/60 p-3 rounded-xl">
          <input type="text" placeholder="Cari uraian transaksi..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">Semua Aliran Kas</option>
            <option value="masuk">🟢 Aliran Masuk</option>
            <option value="keluar">🔴 Aliran Keluar</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">Semua Kategori Pos</option>
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Tabel Utama Kas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[9px] tracking-wider">
                <th className="p-3">Tanggal</th><th className="p-3">Pos Kategori</th><th className="p-3">Uraian Keterangan</th><th className="p-3 text-right">Nominal Angka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              {filteredTrans.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20 transition-all">
                  <td className="p-3 font-mono text-slate-500">{t.transaction_date}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded font-mono text-[9px] uppercase">{t.category}</span></td>
                  <td className="p-3 truncate max-w-xs font-medium">{t.description}</td>
                  <td className={`p-3 text-right font-mono font-black ${t.type === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= AREA FORM LPJ DOKUMEN CETAK KERTAS A4 (MURNI HITAM PUTIH FORMAL) ================= */}
      <div className="hidden print:block bg-white text-black p-10 font-serif leading-relaxed text-xs">
        <div className="text-center border-b-4 border-double border-black pb-3 mb-6 space-y-1">
          <h1 className="text-base font-bold uppercase font-sans tracking-wide">{metaOrg.name}</h1>
          <p className="text-[9px] font-sans italic text-gray-500">{metaOrg.address}</p>
          <h2 className="text-xs font-bold uppercase pt-3 font-sans underline tracking-widest">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN HAUL REAL-TIME</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 font-sans border border-black p-3 rounded mb-6 text-[10px] bg-gray-50">
          <div><p className="text-gray-500 uppercase font-bold">Total Penerimaan</p><p className="text-xs font-black text-green-700">{formatRupiah(totalLpjMasuk)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Total Pengeluaran Alokasi</p><p className="text-xs font-black text-red-700">{formatRupiah(totalLpjKeluar)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Sisa Saldo Kas Bersih</p><p className="text-xs font-black text-blue-800 underline">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</p></div>
        </div>

        {/* REKAP POS IN */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold uppercase text-[10px] border-b border-black pb-0.5 text-green-800">1. REALISASI KAS MASUK (PENERIMAAN)</h3>
          {Object.keys(lpjMasuk).map((cat, i) => (
            <div key={i} className="space-y-1">
              <h4 className="font-sans font-bold text-[10px] text-gray-700 bg-gray-100 pl-1 uppercase">Pos Anggaran: {cat}</h4>
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-gray-400 italic text-gray-500"><th className="py-1 w-20">Tanggal</th><th className="py-1">Keterangan / Donatur</th><th className="py-1 text-right w-28">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lpjMasuk[cat].map((t, idx) => (
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td className="py-1">{t.description}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* REKAP POS OUT */}
        <div className="space-y-4 pt-6">
          <h3 className="font-sans font-bold uppercase text-[10px] border-b border-black pb-0.5 text-red-800">2. REALISASI KAS KELUAR (BELANJA OPERASIONAL)</h3>
          {Object.keys(lpjKeluar).map((cat, i) => (
            <div key={i} className="space-y-1">
              <h4 className="font-sans font-bold text-[10px] text-gray-700 bg-gray-100 pl-1 uppercase">Pos Operasional: {cat}</h4>
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-gray-400 italic text-gray-500"><th className="py-1 w-20">Tanggal</th><th className="py-1">Uraian Alokasi Keperluan</th><th className="py-1 text-right w-28">Jumlah</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lpjKeluar[cat].map((t, idx) => (
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td className="py-1">{t.description}</td><td className="py-1 text-right font-mono">{formatRupiah(t.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* TANDA TANGAN VALIDASI */}
        <div className="mt-16 grid grid-cols-2 text-center font-sans text-[10px] pt-8">
          <div className="space-y-14"><p>Mengetahui,<br /><b>Ketua Panitia Haul</b></p><p className="underline font-bold">( ........................................ )</p></div>
          <div className="space-y-14"><p>Cirebon, {new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}<br /><b>Bendahara Panitia</b></p><p className="underline font-bold">( ........................................ )</p></div>
        </div>
      </div>

    </div>
  );
}
