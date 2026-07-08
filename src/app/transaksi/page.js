'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TransaksiPage() {
  const [loading, setLoading] = useState(true);
  const [allDonations, setAllDonations] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
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
      console.error("Gagal verifikasi auth:", err);
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

  async function loadData() {
    try {
      setLoading(true);
      
      const { data: setDb } = await supabase.from('settings').select('*').eq('id', 'main_config');
      if (setDb && setDb.length > 0) {
        setMetaOrg({ 
          name: setDb[0].org_name || 'PANITIA HAUL MAQBAROH BUYUT KEPUH & BUYUT BESUS', 
          address: setDb[0].address || 'Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon' 
        });
      } else {
        setMetaOrg({
          name: 'PANITIA HAUL MAQBAROH BUYUT KEPUH & BUYUT BESUS',
          address: 'Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon'
        });
      }

      const { data: catDb } = await supabase.from('category').select('*').order('name', { ascending: true });
      if (catDb && catDb.length > 0) {
        setCategories(catDb);
        if (!formCategory) setFormCategory(catDb[0].name);
      }

      const { data: donationsDb } = await supabase.from('donation_details').select('*');
      const { data: expensesDb } = await supabase.from('transactions').select('*');
        
      if (donationsDb) setAllDonations(donationsDb);
      if (expensesDb) setAllExpenses(expensesDb);
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
      type: formType === 'Pengeluaran' ? 'keluar' : 'masuk',
      category: finalCategory,
      note: formDescription.trim(),
      amount: cleanAmount
    };

    try {
      if (isEditMode) {
        await supabase.from('transactions').update(payload).eq('id', selectedId);
        alert('✏️ Data berhasil diperbarui.');
      } else {
        await supabase.from('transactions').insert([payload]);
        alert('➕ Data baru berhasil ditambahkan.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      alert('❌ Gagal menyimpan transaksi.');
    }
  };

  const triggerEdit = (item) => {
    setSelectedId(item.id);
    setIsEditMode(true);
    setFormDate(item.transaction_date);
    setFormType(item.aliranJenis === 'Keluar' ? 'Pengeluaran' : 'Pemasukan');
    setFormCategory(item.category);
    setFormDescription(item.uraian);
    setFormAmount(item.amount);
    setShowModal(true);
  };

  const triggerHapus = async (id, isFromExpenses) => {
    if (!isAdmin) return;
    if (!confirm('Hapus permanen catatan transaksi internal ini?')) return;
    try {
      const targetTable = isFromExpenses ? 'transactions' : 'donation_details';
      const { error } = await supabase.from(targetTable).delete().eq('id', id);
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
    if (categories.length > 0) setFormCategory(categories[0].name);
    setShowModal(false);
  };

  const prosesDataGabunganMurni = () => {
    const petaGabungan = {};

    allDonations.forEach((item) => {
      const tgl = item.transaction_date;
      const kat = item.category;
      const isAdminFee = item.donor_name === '__ADMIN_FEE__';
      const isSaldoMengendap = item.donor_name === '__SALDO_MENGENDAP__';

      if (isAdminFee || isSaldoMengendap) {
        const keySistem = `${tgl}_${kat}_${item.donor_name}_${item.id}`;
        petaGabungan[keySistem] = {
          id: item.id,
          transaction_date: tgl,
          category: kat,
          amount: Math.abs(item.amount),
          aliranJenis: isAdminFee ? 'Keluar' : 'Masuk', 
          isSystem: true,
          isFromExpenses: false,
          uraian: isAdminFee 
            ? `Potongan Admin Fee Kolektif Bulan ${tgl?.substring(0, 7)}` 
            : `Saldo Mengendap Bulan ${tgl?.substring(0, 7)}`
        };
        return;
      }

      const grupKey = `${tgl}_${kat}_Donatur`;

      if (!petaGabungan[grupKey]) {
        petaGabungan[grupKey] = {
          id: item.id,
          transaction_date: tgl,
          category: kat,
          amount: 0,
          isSystem: false,
          isFromExpenses: false,
          aliranJenis: 'Masuk',
          jumlahDonatur: 0
        };
      }

      petaGabungan[grupKey].amount += Math.abs(item.amount);
      petaGabungan[grupKey].jumlahDonatur += 1;
    });

    allExpenses.forEach((item) => {
      const tgl = item.transaction_date;
      const kat = item.category;
      const type = (item.type || '').toLowerCase().trim();
      const isKeluar = type === 'keluar' || type === 'pengeluaran';
      const noteText = item.note || '';

      if (!isKeluar && noteText.toLowerCase().includes('aplikasi pemasukan')) {
        return; 
      }

      const expKey = `EXP_${item.id}`;
      petaGabungan[expKey] = {
        id: item.id,
        transaction_date: tgl,
        category: kat,
        amount: Math.abs(item.amount),
        aliranJenis: isKeluar ? 'Keluar' : 'Masuk',
        isSystem: true,
        isFromExpenses: true,
        uraian: noteText || 'Pengeluaran Tanpa Keterangan'
      };
    });

    return Object.values(petaGabungan).map(grup => {
      if (!grup.isSystem) {
        grup.uraian = `GABUNGAN DARI ${grup.jumlahDonatur} DONATUR ${grup.category.toUpperCase()}`;
      }
      return grup;
    }).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  };

  const dataTransaksiFinal = prosesDataGabunganMurni();

  let totalLpjMasuk = 0; 
  let totalLpjKeluar = 0;
  dataTransaksiFinal.forEach(item => {
    if (item.aliranJenis === 'Masuk') totalLpjMasuk += item.amount;
    else totalLpjKeluar += item.amount;
  });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const filteredTrans = dataTransaksiFinal.filter(t => {
    const matchSearch = t.uraian.toLowerCase().includes(search.toLowerCase());
    
    let matchType = false;
    if (typeFilter === 'all') matchType = true;
    else if (typeFilter === 'masuk') matchType = t.aliranJenis === 'Masuk';
    else if (typeFilter === 'keluar') matchType = t.aliranJenis === 'Keluar';

    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  // 🚀 FUNGSI EXCEL REVOLUSIONER: Aman tanpa crash library window global
  const handleExportExcelManual = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Tanggal,Kategori,Uraian Keterangan,Jenis,Nominal\n";
      
      filteredTrans.forEach(t => {
        const row = `"${t.transaction_date}","${t.category}","${t.uraian}","${t.aliranJenis}",${t.amount}\n`;
        csvContent += row;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LAPORAN_BukuKas_Haul_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Gagal mengekspor file data: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">Sinkronisasi integrasi pembukuan kas...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white">
      
      {/* AREA UTAMA INTERFACES - HIDDEN KETIKA CETAK */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider">💰 Buku Kas & Transaksi Haul</h2>
              {isAdmin ? <span className="bg-green-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">ADMIN</span> : <span className="bg-red-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">PUBLIC</span>}
            </div>
            <p className="text-[10px] font-mono mt-0.5 text-slate-400">● Murni Grouping pertanggal & Integrasi Kas Keluar Aktif</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {isAdmin && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 text-white font-bold uppercase rounded-xl shadow-md">➕ Tambah Kas</button>
            )}
            <button onClick={handleExportExcelManual} className="flex-1 sm:flex-initial px-4 py-2 bg-teal-600 text-white font-bold uppercase rounded-xl shadow-md">📊 Excel Data</button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl shadow-md">🖨️ Cetak LPJ</button>
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

        {/* DATA TABLE DISPLAY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto shadow-lg relative scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[9px] tracking-wider sticky top-0 z-20 shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
                <th className="p-3 w-24 bg-slate-950">Tanggal</th>
                <th className="p-3 w-28 bg-slate-950">Pos Kategori</th>
                <th className="p-3 bg-slate-950">Uraian Keterangan</th>
                <th className="p-3 text-right w-32 bg-slate-950">Nominal Angka</th>
                {isAdmin && <th className="p-3 text-center w-36 bg-slate-950">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              {filteredTrans.map((t, idx) => {
                const isKeluar = t.aliranJenis === 'Keluar';
                return (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-3 font-mono text-slate-500 text-[10px] whitespace-nowrap">{t.transaction_date}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 border rounded font-mono text-[9px] uppercase ${!isKeluar ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {t.category}
                      </span> 
                    </td>
                    <td className="p-3 font-medium text-[11px] sm:text-xs text-neutral-200 uppercase tracking-wide">
                      {t.uraian}
                    </td>
                    <td className={`p-3 text-right font-mono font-black whitespace-nowrap ${!isKeluar ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {!isKeluar ? '+' : '-'}{formatRupiah(t.amount)}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center space-x-2 font-mono whitespace-nowrap">
                        {t.isSystem ? (
                          <>
                            {t.isFromExpenses && (
                              <button type="button" onClick={() => triggerEdit(t)} className="text-amber-400 hover:underline font-bold px-1 py-0.5">Edit</button>
                            )}
                            <button type="button" onClick={() => triggerHapus(t.id, t.isFromExpenses)} className="text-rose-400 hover:underline font-bold px-1 py-0.5">Hapus</button>
                          </>
                        ) : (
                          <span className="text-slate-600 italic text-[10px]">🔒 Terkunci Privasi</span>
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

      {/* REGISTRASI MODAL INPUT DIALOG */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:hidden">
          <form onSubmit={handleSaveTransaction} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              {isEditMode ? '✏️ Ubah Catatan Operasional' : '➕ Registrasi Catatan Kas Baru'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Tanggal</label>
                <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-center font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Aliran Jenis</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none">
                  <option value="Pengeluaran">🔴 Pengeluaran (Merah)</option>
                  <option value="Pemasukan">🟢 Pemasukan (Hijau)</option>
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
              <label className="block text-slate-400 mb-1">Nominal Rupiah</label>
              <input type="number" placeholder="Contoh: 500000" required value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none font-mono text-right font-bold text-amber-400 text-sm" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Uraian Keterangan</label>
              <input type="text" placeholder="Misal: DP Sound System" required value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black uppercase rounded-xl shadow-lg">Simpan Kas</button>
            </div>
          </form>
        </div>
      )}

      {/* 🖨️ AREA CETAK LPJ PROFESIONAL (HANYA MUNCUL SAAT DI-PRINT / DI-SAVE PDF) */}
      <div className="hidden print:block bg-white text-black p-4 font-[serif] text-xs leading-relaxed w-full">
        <div className="text-center border-b-4 border-double border-black pb-3 mb-6">
          <h1 className="text-base font-bold uppercase font-sans tracking-wide">{metaOrg.name}</h1>
          <p className="text-[10px] font-sans italic text-gray-600">{metaOrg.address}</p>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase underline tracking-widest font-sans">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN HAUL</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Periode: Real-Time s/d {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 font-sans border border-black p-3 rounded mb-6 text-[10px] bg-gray-50 text-center">
          <div><p className="text-gray-500 uppercase font-bold">Total Penerimaan</p><p className="text-sm font-black text-green-700">{formatRupiah(totalLpjMasuk)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Total Pengeluaran</p><p className="text-sm font-black text-red-700">{formatRupiah(totalLpjKeluar)}</p></div>
          <div><p className="text-gray-500 uppercase font-bold">Sisa Saldo Kas Bersih</p><p className="text-sm font-black text-blue-800 underline font-bold">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</p></div>
        </div>

        <div className="space-y-6">
          {/* TABEL PEMASUKAN */}
          <div>
            <h3 className="font-bold text-xs uppercase mb-1.5 font-sans border-b border-black pb-0.5">A. Aliran Arus Kas Masuk</h3>
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100 font-bold">
                  <th className="py-1 px-2 w-24">Tanggal</th>
                  <th className="py-1 px-2 w-32">Kategori Pos</th>
                  <th className="py-1 px-2">Uraian Keterangan</th>
                  <th className="py-1 px-2 text-right w-32">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {dataTransaksiFinal.filter(x => x.aliranJenis === 'Masuk').map((t, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1 px-2 font-mono text-gray-600">{t.transaction_date}</td>
                    <td className="py-1 px-2 uppercase text-gray-700">{t.category}</td>
                    <td className="py-1 px-2 uppercase font-sans text-gray-900">{t.uraian}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-green-700">+{formatRupiah(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABEL PENGELUARAN */}
          <div className="pt-4">
            <h3 className="font-bold text-xs uppercase mb-1.5 font-sans border-b border-black pb-0.5">B. Aliran Arus Kas Keluar (Belanja)</h3>
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100 font-bold">
                  <th className="py-1 px-2 w-24">Tanggal</th>
                  <th className="py-1 px-2 w-32">Kategori Pos</th>
                  <th className="py-1 px-2">Uraian Keterangan</th>
                  <th className="py-1 px-2 text-right w-32">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {dataTransaksiFinal.filter(x => x.aliranJenis === 'Keluar').map((t, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1 px-2 font-mono text-gray-600">{t.transaction_date}</td>
                    <td className="py-1 px-2 uppercase text-gray-700">{t.category}</td>
                    <td className="py-1 px-2 uppercase font-sans text-gray-900">{t.uraian}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-red-700">-{formatRupiah(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HALAMAN VALIDASI TANDA TANGAN KETUA & BENDAHARA */}
        <div className="mt-12 break-inside-avoid">
          <p className="text-right text-[10px] text-gray-700 italic mb-10">
            Cirebon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="grid grid-cols-2 gap-8 text-center text-[11px] font-sans">
            <div>
              <p className="font-bold uppercase tracking-wider mb-16">Mengetahui,<br />Ketua Panitia Haul</p>
              <p className="font-bold underline uppercase">( ________________________ )</p>
              <p className="text-[9px] text-gray-500 mt-0.5">PANITIA HAUL 2026</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider mb-16">Dibuat Oleh,<br />Bendahara Panitia</p>
              <p className="font-bold underline uppercase">( ________________________ )</p>
              <p className="text-[9px] text-gray-500 mt-0.5">PANITIA HAUL 2026</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
