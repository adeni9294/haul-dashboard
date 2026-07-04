'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TransaksiPage() {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [metaOrg, setMetaOrg] = useState({ name: 'PANITIA HAUL', address: '' });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState('Pemasukan');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    checkAdminSessionAndLoad();
    loadData();

    const interval = setInterval(checkAdminSessionOnly, 500);
    return () => clearInterval(interval);
  }, []);

  async function checkAdminSessionAndLoad() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      console.error("Gagal verifikasi auth di page:", err);
      setIsAdmin(false);
    }
  }

  async function checkAdminSessionOnly() {
    const savedPassword = localStorage.getItem('admin_password_haul');
    if (!savedPassword) return setIsAdmin(false);
    try {
      const { data: isValid } = await supabase.rpc('verify_admin_password', { p_password: savedPassword });
      setIsAdmin(!!isValid);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  const pisahNamaDanAlamat = (fullDonorName) => {
    if (!fullDonorName) return { nama: '', alamat: '' };
    if (fullDonorName === '__ADMIN_FEE__' || fullDonorName === '__SALDO_MENGENDAP__') {
      return { nama: fullDonorName, alamat: '' };
    }
    const parts = fullDonorName.split(' - ');
    const nama = parts[0] ? parts[0].trim() : '';
    const alamat = parts[1] ? parts[1].trim() : 'Warga';
    return { nama, alamat };
  };

  async function loadData() {
    try {
      setLoading(true);
      
      const { data: setDb } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (setDb && setDb.length > 0) {
        setMetaOrg({ name: setDb[0].org_name || 'PANITIA HAUL', address: setDb[0].address || '' });
      }

      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        setCategories(catDb);
        if (!formCategory) setFormCategory(catDb[0].name);
      } else {
        const defaultCats = [{ name: 'Kas Umum' }, { name: 'Administrasi' }];
        setCategories(defaultCats);
        if (!formCategory) setFormCategory(defaultCats[0].name);
      }

      const { data: transDb } = await supabase
        .from('donation_details')
        .select('*')
        .order('transaction_date', { ascending: false });
        
      if (transDb) setAllTransactions(transDb);
    } catch (e) {
      console.error("Gagal load data: ", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const cleanAmount = parseFloat(formAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    if (cleanAmount <= 0) return;

    const finalCategory = formCategory || (categories.length > 0 ? categories[0].name : 'Lain-lain');
    const payload = {
      transaction_date: formDate,
      donor_name: formDescription.trim(), 
      category: finalCategory,
      amount: formType === 'Pengeluaran' ? -Math.abs(cleanAmount) : Math.abs(cleanAmount)
    };

    try {
      if (isEditMode) {
        await supabase.from('donation_details').update(payload).eq('id', selectedId);
      } else {
        await supabase.from('donation_details').insert([payload]);
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerHapus = async (id) => {
    if (!isAdmin) return;
    if (!confirm('Hapus permanen catatan transaksi ini?')) return;
    try {
      const { error } = await supabase.from('donation_details').delete().eq('id', id);
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
    setFormDescription('');
    setFormAmount('');
    setShowModal(false);
  };

  // 🔄 FUNGSI UTAMA: Mengelompokkan data berdasarkan tanggal & menyamarkan nama donatur
  const dapatkanDataGabunganDinamis = () => {
    const petaGabungan = {};

    allTransactions.forEach((item) => {
      const tgl = item.transaction_date;
      const kat = item.category;
      const isAdminFee = item.donor_name === '__ADMIN_FEE__';
      const isSaldoMengendap = item.donor_name === '__SALDO_MENGENDAP__';
      const { alamat } = pisahNamaDanAlamat(item.donor_name);

      // Jika data sistem (Fee / Saldo), jangan digabungkan dengan donatur biasa
      if (isAdminFee || isSaldoMengendap) {
        const keySistem = `${tgl}_${kat}_${item.donor_name}_${item.id}`;
        petaGabungan[keySistem] = {
          id: item.id,
          transaction_date: tgl,
          category: kat,
          amount: item.amount,
          isSystem: true,
          uraian: isAdminFee 
            ? `Potongan Admin Fee Kolektif Bulan ${tgl?.substring(0, 7)}` 
            : `Saldo Mengendap Bulan ${tgl?.substring(0, 7)}`,
          rawItems: [item]
        };
        return;
      }

      // Gabungkan berdasarkan Kunci: Tanggal + Kategori + Wilayah Alamat
      const grupKey = `${tgl}_${kat}_${alamat || 'Warga'}`;

      if (!petaGabungan[grupKey]) {
        petaGabungan[grupKey] = {
          id: item.id,
          transaction_date: tgl,
          category: kat,
          amount: 0,
          isSystem: false,
          alamatWilayah: alamat,
          jumlahDonatur: 0,
          rawItems: []
        };
      }

      petaGabungan[grupKey].amount += item.amount;
      petaGabungan[grupKey].jumlahDonatur += 1;
      petaGabungan[grupKey].rawItems.push(item);
    });

    // Konversi hasil pemetaan ke bentuk Array dan susun keterangannya
    return Object.values(petaGabungan).map(grup => {
      if (grup.isSystem) return grup;

      // Samarkan nama donatur demi menjaga privasi
      const teksWilayah = grup.alamatWilayah ? ` (${grup.alamatWilayah})` : '';
      grup.uraian = `Gabungan dari ${grup.jumlahDonatur} donatur detail (Hamba Allah${teksWilayah})`;
      return grup;
    }).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  };

  const dataTransaksiFinal = dapatkanDataGabunganDinamis();

  // Hitung total nilai penerimaan & pengeluaran untuk LPJ Cetak
  let totalLpjMasuk = 0; let totalLpjKeluar = 0;
  const lpjMasuk = {}; const lpjKeluar = {};

  dataTransaksiFinal.forEach(item => {
    const nominal = Math.abs(item.amount) || 0;
    const isPengeluaran = item.amount < 0 || item.uraian.includes('Admin Fee');
    const cat = item.category || 'Lain-lain';

    if (!isPengeluaran) {
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

  const filteredTrans = dataTransaksiFinal.filter(t => {
    const matchSearch = t.uraian.toLowerCase().includes(search.toLowerCase());
    const isPengeluaran = t.amount < 0 || t.uraian.includes('Admin Fee');

    let matchType = false;
    if (typeFilter === 'all') matchType = true;
    else if (typeFilter === 'masuk') matchType = !isPengeluaran;
    else if (typeFilter === 'keluar') matchType = isPengeluaran;

    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Sinkronisasi database kas pertanggungjawaban...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider">💰 Buku Kas & Transaksi Haul</h2>
              {isAdmin ? <span className="bg-green-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">ADMIN</span> : <span className="bg-red-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">PUBLIC</span>}
            </div>
            <p className="text-[10px] font-mono mt-0.5 text-slate-400">● Real-time Grouping & Privacy Mode Enabled</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl hover:bg-amber-400 transition-all shadow-md">🖨️ Cetak LPJ</button>
          </div>
        </div>

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

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-lg">
          <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[9px] tracking-wider">
                <th className="p-3 w-24">Tanggal</th>
                <th className="p-3 w-28">Pos Kategori</th>
                <th className="p-3">Uraian Keterangan</th>
                <th className="p-3 text-right w-32">Nominal Angka</th>
                {isAdmin && <th className="p-3 text-center w-28">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              {filteredTrans.map((t, idx) => {
                const isPengeluaran = t.amount < 0 || t.uraian.includes('Admin Fee');
                
                return (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-3 font-mono text-slate-500 text-[10px] whitespace-nowrap">{t.transaction_date}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 border rounded font-mono text-[9px] uppercase ${!isPengeluaran ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium break-words max-w-[150px] sm:max-w-none text-[11px] sm:text-xs text-neutral-300">
                      {t.uraian}
                    </td>
                    <td className={`p-3 text-right font-mono font-black whitespace-nowrap ${!isPengeluaran ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {!isPengeluaran ? '+' : '-'}{formatRupiah(Math.abs(t.amount))}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center space-x-2 font-mono whitespace-nowrap">
                        {t.isSystem ? (
                          <button type="button" onClick={() => triggerHapus(t.id)} className="text-rose-400 hover:underline font-bold px-1 py-0.5">Hapus</button>
                        ) : (
                          <span className="text-slate-600 italic text-[10px]">Aksi Terkunci (Grup)</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredTrans.length === 0 && (
                <tr><td colSpan={isAdmin ? 5 : 4} className="p-6 text-center text-slate-500 font-mono">Tidak ada catatan transaksi ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT AREA LAYOUT */}
      <div className="hidden print:block bg-white text-black p-10 font-serif text-xs">
        <div className="text-center border-b-4 border-double border-black pb-3 mb-6">
          <h1 className="text-base font-bold uppercase font-sans">{metaOrg.name}</h1>
          <p className="text-[9px] font-sans italic text-gray-500">{metaOrg.address}</p>
          <h2 className="text-xs font-bold uppercase pt-3 font-sans underline tracking-widest">LAPORAN KEUANGAN HAUL REAL-TIME (PRIVACY ASSURED)</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 font-sans border border-black p-3 rounded mb-6 text-[10px] bg-gray-50">
          <div><p className="text-gray-500 uppercase font-bold">Total Penerimaan</p><p className="text-xs font-black text-green-700">{formatRupiah(totalLpjMasuk)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Total Pengeluaran</p><p className="text-xs font-black text-red-700">{formatRupiah(totalLpjKeluar)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Sisa Saldo Kas</p><p className="text-xs font-black text-blue-800 underline">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</p></div>
        </div>

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
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td>{t.uraian}</td><td className="py-1 text-right font-mono">{formatRupiah(Math.abs(t.amount))}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

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
                    <tr key={idx}><td className="py-1 font-mono">{t.transaction_date}</td><td>{t.uraian}</td><td className="py-1 text-right font-mono">{formatRupiah(Math.abs(t.amount))}</td></tr>
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
