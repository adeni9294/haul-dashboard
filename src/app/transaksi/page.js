'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🌐 KAMUS MULTI-BAHASA (INDONESIA, REANG/CIREBON, ENGLISH)
const translations = {
  id: {
    title: "💰 Buku Kas & Transaksi Haul",
    subtitle: "● Murni Grouping pertanggal & Integrasi Kas Keluar Aktif",
    btnTambah: "➕ Tambah Kas",
    btnExcel: "📊 Excel Data",
    btnCetak: "🖨️ Cetak LPJ",
    searchPlaceholder: "Cari uraian keterangan...",
    allCash: "Semua Aliran Kas",
    onlyIn: "🟢 Hanya Kas Masuk",
    onlyOut: "🔴 Hanya Kas Keluar",
    allCat: "Semua Kategori Pos",
    thDate: "Tanggal",
    thCat: "Pos Kategori",
    thDesc: "Uraian Keterangan",
    thAmount: "Nominal Angka",
    thAction: "Aksi",
    noData: "Tidak ada catatan transaksi ditemukan.",
    syncData: "Sinkronisasi integrasi pembukuan kas...",
    lpjTitle: "LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN HAUL",
    lpjPeriod: "Periode: Real-Time s/d",
    tblHeaderDesc: "Deskripsi / Ikhtisar Akun",
    tblHeaderAmount: "Jumlah Kas (IDR)",
    totalIn: "Total Penerimaan Arus Kas Masuk (A)",
    totalOut: "Total Pengeluaran Belanja Operasional (B)",
    netBalance: "Sisa Saldo Buku Kas Bersih (A - B)",
    sectIn: "A. Buku Rincian Aliran Arus Kas Masuk",
    sectOut: "B. Buku Rincian Aliran Arus Kas Keluar (Belanja)",
    thLpjDesc: "Uraian Keterangan Transaksi",
    signKnow: "Mengetahui,",
    signChair: "Ketua Panitia Haul",
    signMade: "Dibuat Oleh,",
    signTreasurer: "Bendahara Panitia",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    summarySect: "IKHTISAR REKAP TOTAL PER KATEGORI POS KAS",
    summaryCat: "Kategori Pos Anggaran",
    summaryTotal: "Total Realisasi Dana"
  },
  jv: { 
    title: "💰 Buku Kas & Transaksi Haul",
    subtitle: "● Murni Grouping pertanggal & Integrasi Kas Keluar Aktif",
    btnTambah: "➕ Tambah Kas",
    btnExcel: "📊 Pragat Excel",
    btnCetak: "🖨️ Cetak LPJ",
    searchPlaceholder: "Goleki keterangan...",
    allCash: "Kabeh Aliran Kas",
    onlyIn: "🟢 Pragat Mlebu Tok",
    onlyOut: "🔴 Pragat Blonjo Tok",
    allCat: "Kabeh Werna Pos",
    thDate: "Tanggal",
    thCat: "Pos Kategori",
    thDesc: "Keterangan",
    thAmount: "Nominal Angka",
    thAction: "Aksi",
    noData: "Durung ana catatan transaksi.",
    syncData: "Nembe ngebuka integrasi pembukuan kas...",
    lpjTitle: "LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN HAUL",
    lpjPeriod: "Periode: Real-Time s/d",
    tblHeaderDesc: "Keterangan / Ikhtisar Akun",
    tblHeaderAmount: "Jumlah Kas (IDR)",
    totalIn: "Total Pragat Kas Mlebu (A)",
    totalOut: "Total Pragat Blonjo Operasional (B)",
    netBalance: "Sisa Saldo Buku Kas Bersih (A - B)",
    sectIn: "A. Buku Rincian Aliran Arus Kas Mlebu",
    sectOut: "B. Buku Rincian Aliran Arus Kas Metu (Blonjo)",
    thLpjDesc: "Keterangan Transaksi",
    signKnow: "Weruh,",
    signChair: "Ketua Panitia Haul",
    signMade: "Sing Gawe,",
    signTreasurer: "Bendahara Panitia",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    summarySect: "IKHTISAR REKAP TOTAL PER KATEGORI POS KAS",
    summaryCat: "Kategori Pos Anggaran",
    summaryTotal: "Total Realisasi Dana"
  },
  en: {
    title: "💰 Cash Book & Haul Transactions",
    subtitle: "● Pure daily grouping & Active cash outflow integration",
    btnTambah: "➕ Add Cash",
    btnExcel: "📊 Export Excel",
    btnCetak: "🖨️ Print Report",
    searchPlaceholder: "Search description...",
    allCash: "All Cash Flows",
    onlyIn: "🟢 Cash Inflow Only",
    onlyOut: "🔴 Cash Outflow Only",
    allCat: "All Categories",
    thDate: "Date",
    thCat: "Category Pos",
    thDesc: "Description Note",
    thAmount: "Amount",
    thAction: "Action",
    noData: "No transaction records found.",
    syncData: "Synchronizing cash book integration...",
    lpjTitle: "FINANCIAL ACCOUNTABILITY REPORT (LPJ) OF HAUL",
    lpjPeriod: "Period: Real-Time as of",
    tblHeaderDesc: "Description / Account Overview",
    tblHeaderAmount: "Cash Amount (IDR)",
    totalIn: "Total Cash Inflows (A)",
    totalOut: "Total Operational Expenditures (B)",
    netBalance: "Net Cash Balance (A - B)",
    sectIn: "A. Detailed Cash Inflow Ledger",
    sectOut: "B. Detailed Cash Outflow Ledger (Expenditure)",
    thLpjDesc: "Transaction Description Details",
    signKnow: "Approved By,",
    signChair: "Haul Committee Chairman",
    signMade: "Prepared By,",
    signTreasurer: "Committee Treasurer",
    signGroup: "2026 HAUL COMMITTEE",
    city: "Cirebon",
    summarySect: "SUMMARY OF TOTALS BY CASH POSITION CATEGORY",
    summaryCat: "Budget Position Category",
    summaryTotal: "Total Realized Funds"
  }
};

export default function TransaksiPage() {
  const [lang, setLang] = useState('id');
  const t = translations[lang] || translations['id'];

  const [loading, setLoading] = useState(true);
  const [allDonations, setAllDonations] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [metaOrg, setMetaOrg] = useState({ 
    name: 'PANITIA HAUL', 
    address: '',
    ketua: '....................',
    bendahara: '....................'
  });

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
      let currentName = 'PANITIA HAUL MAQBAROH BUYUT KEPUH & BUYUT BESUS';
      let currentAddress = 'Blok Cibogo Kidul RT/RW. 002/003 Desa Warujaya Kec. Depok Kab. Cirebon';

      if (setDb && setDb.length > 0) {
        currentName = setDb[0].org_name || currentName;
        currentAddress = setDb[0].address || currentAddress;
      }

      const { data: committeeDb } = await supabase.from('committee').select('*');
      let currentKetua = '....................';
      let currentBendahara = '....................';

      if (committeeDb && committeeDb.length > 0) {
        currentKetua = committeeDb.find(c => c.position?.toLowerCase() === 'ketua')?.name || currentKetua;
        currentBendahara = committeeDb.find(c => c.position?.toLowerCase() === 'bendahara')?.name || currentBendahara;
      }

      setMetaOrg({
        name: currentName,
        address: currentAddress,
        ketua: currentKetua,
        bendahara: currentBendahara
      });

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
        grup.uraian = lang === 'id' 
          ? `GABUNGAN DARI ${grup.jumlahDonatur} DONATUR ${grup.category.toUpperCase()}`
          : lang === 'jv'
          ? `GABUNGAN SAKING ${grup.jumlahDonatur} DONATUR ${grup.category.toUpperCase()}`
          : `COMBINED OF ${grup.jumlahDonatur} DONORS ${grup.category.toUpperCase()}`;
      }
      return grup;
    }).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  };

  const dataTransaksiFinal = prosesDataGabunganMurni();

  const rekapKategoriMasuk = {};
  const rekapKategoriKeluar = {};
  let totalLpjMasuk = 0; 
  let totalLpjKeluar = 0;

  dataTransaksiFinal.forEach(item => {
    if (item.aliranJenis === 'Masuk') {
      totalLpjMasuk += item.amount;
      rekapKategoriMasuk[item.category] = (rekapKategoriMasuk[item.category] || 0) + item.amount;
    } else {
      totalLpjKeluar += item.amount;
      rekapKategoriKeluar[item.category] = (rekapKategoriKeluar[item.category] || 0) + item.amount;
    }
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

  if (loading) return <div className="text-center py-12 text-xs font-mono text-slate-500">{t.syncData}</div>;

  return (
    <div id="root-transaksi-container" className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs text-white relative">
      
      {/* 🛠️ ULTRA TOTAL KILLER PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #root-transaksi-container, #root-transaksi-container * {
            visibility: visible !important;
          }
          #root-transaksi-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            color: black !important;
          }
          .print\\:hidden, .print\\:hidden * {
            display: none !important;
            height: 0 !important;
          }
          body, html {
            background: white !important;
            color: black !important;
          }
          
          /* 🔥 FORCE CONTAINER LOGO PRINT: Memaksa elemen penampung logo muncul */
          .logo-box-print {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .print-page-wrapper {
            background: white !important;
            color: black !important;
            page-break-inside: avoid !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 10px !important;
          }
        }
      `}} />

      {/* AREA UTAMA INTERFACES - HIDDEN KETIKA CETAK */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider">{t.title}</h2>
              {isAdmin ? <span className="bg-green-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">ADMIN</span> : <span className="bg-red-600 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase font-mono">PUBLIC</span>}
            </div>
            <p className="text-[10px] font-mono mt-0.5 text-slate-400">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl mr-1">
              <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${lang === 'id' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>ID 🇮🇩</button>
              <button onClick={() => setLang('jv')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${lang === 'jv' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>JV 🎯</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${lang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>EN 🇬🇧</button>
            </div>

            {isAdmin && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 text-white font-bold uppercase rounded-xl shadow-md">{t.btnTambah}</button>
            )}
            <button onClick={handleExportExcelManual} className="flex-1 sm:flex-initial px-4 py-2 bg-teal-600 text-white font-bold uppercase rounded-xl shadow-md">{t.btnExcel}</button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 text-slate-950 font-black uppercase rounded-xl shadow-md">{t.btnCetak}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800/60 p-3 rounded-xl">
          <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">{t.allCash}</option>
            <option value="masuk">{t.onlyIn}</option>
            <option value="keluar">{t.onlyOut}</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
            <option value="all">{t.allCat}</option>
            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* DATA TABLE DISPLAY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto shadow-lg relative scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[9px] tracking-wider sticky top-0 z-20 shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
                <th className="p-3 w-24 bg-slate-950">{t.thDate}</th>
                <th className="p-3 w-28 bg-slate-950">{t.thCat}</th>
                <th className="p-3 bg-slate-950">{t.thDesc}</th>
                <th className="p-3 text-right w-32 bg-slate-950">{t.thAmount}</th>
                {isAdmin && <th className="p-3 text-center w-36 bg-slate-950">{t.thAction}</th>}
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
                <tr><td colSpan={isAdmin ? 5 : 4} className="p-6 text-center text-slate-500 font-mono">{t.noData}</td></tr>
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

      {/* 🖨️ AREA CETAK LPJ PROFESIONAL */}
      <div className="hidden print:block bg-white text-black p-2 font-serif text-[11px] leading-relaxed w-full">
        
        {/* ==================== HALAMAN 1: REKAP / SUMMARY UTAMA ==================== */}
        <div className="print-page-wrapper">
          {/* Kop Laporan Resmi dengan Aliansi Logo */}
          <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
            
            {/* 🛡️ FORCE RENDERING LOGO MENGGUNAKAN EMBED BASE64 DATA URL */}
            <div className="logo-box-print w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEMElEQVR4nO2bXWgcVRTHT9wPiaLgh6KChb4UfCg+9E0fSgX7UPRBiqAofbN9KILiR/vSgL62wUor2vSlbTZpU9u0SVPbtEnbZpM0SZu0SZu0Tf0nUfcnUhR8eGZubmbyM9mZnZndmZ0PDoWZ3Lnn3v89c++559wz69WvX6MclwAsB7gEwFvHxwAsA7Do993qPAnAXoCzALp+XwWwCOAkgNkA287uAHAZQDfAM8H7GwC6ziwAmM7un7f3R/x+Is96KMBXwXsb8qyHA/zAn/V+gD8G72/Lsx4O8Bv6fEeedS7AaYDP0Oc78qxHAX6j76wlz7oYwPveqiz7fBOfb/b3WjXk+fD5Hn+/VsWcj/Iu8Tke53fXqshXebf4HI7zu2tVkeYbeVfyOfxX8nmUd5M89wDAtXwOf5R8LuLdFvXgZgA38Xf3Obyb5NmIesBtY36E/7GqGf67eFfFM3W4G/iZ4F11E5+v8W6M/1p1vBv42eBdc36Efwv5Fz/S1/P09bxW7fL/fT/P8+E29S1Xn/Lp0r41z0f1KVdF3mZgIsA+Xf8E7wN9vkv9BwG2A+xRP76X8mK9w0X6eZ6+ntfquL5WwLsl6gWfFwDsAfiKv98BcD7AUYAd6scPAnwFfbyw3OFi/TxPX8/rdWjP+wXf7qS/A+wVvOtsw/6/79f5fXb7A8F7G3FhR573S8F7G/H8XvXbCH9bV6MizwFw66Fw25gG7wMAdgXv6gD8AsD6w+fPBNuI3LwI4ALATp0b8fk2f9a7+Hyb3+v9fL6dz9sK6luePuXpG1WbFwPcpnPl6N+gO9SOnGq0v0p/69Ge9Q/pI996vBqfA6D7m8+f4m9/wK98S/r6m8/786vYor7p65u+vlkN/z3ALuG+S9d36O6U7m7pLteXAfYI/yR/+736u7/1q8izX+emwreFvC7mdaWqF6s6A7hH/HshN/U9wT2S+5vU69S9L+X9Cvd/9K5G1e5zAK6Z50O++p6g/876fLd6b9Cef8Nvh68Ld0wA+N6YFwH+XvBeU9X7vF8AODwK8I3+Y/9eT8S/Pcr7Vf8e/Y9bMeeX6e91fX3T1zf9b87FALuXAVwDcF6Yp9XvVwCenVUDfBfg8H71v8ef/SOfv8Sf6UuX+M9lFftR8G9v99vA5wf9We+Oeb/s9ynv5/3O6WNV2/T3vL6+6ZfLw2XmXgXgC8Hz+R99u6z6W7/6jepvV/+D+vfov8Gv3o/D65xXg997AOCYMCfpf9D/sHqHAQ7p66D+97Xv0K08O3XfobtfXwbvD/vP9U3//7YIvg+wX/AnAByU57/gN6q+vunrm37Vb3+fIu+E7/Y9wfsC72O8b1MvAByWd78EbyPAn+BvL/Bnj6s/f8qf/f3MvRrAt3ReALAN4HPBtwnvM7yvAnxOf496p0cBXqB/mXreF16g/yN5f9KfZ679b32u6L8F3AnfVnBnyvst74u886Gq5V0g/N39NujvBv0vAnxaT9w1APfR/4/w6gT9T+uJu8b1p9pOfv0a9bM1/AsIlgw8uW6fDwAAAABJRU5ErkJggg==" 
                alt="Logo Haul" 
                className="w-16 h-16 object-contain"
              />
            </div>
            
            {/* Sisi Tengah: Detail Text Organisasi */}
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg font-bold uppercase font-sans tracking-wide leading-tight">{metaOrg.name}</h1>
              <p className="text-[9px] font-sans italic text-gray-700 mt-0.5">{metaOrg.address}</p>
            </div>

            {/* Sisi Kanan: Ruang Kosong Penyeimbang Grid Kop */}
            <div className="w-16 h-16 flex-shrink-0 print:hidden sm:block"></div>
          </div>
          
          {/* Judul Laporan */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold uppercase underline tracking-widest font-sans">{t.lpjTitle}</h2>
            <p className="text-[9px] text-gray-500 mt-0.5">{t.lpjPeriod} {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Neraca Laporan Utama */}
          <table className="w-full border-collapse border border-black text-[11px] mb-6 font-sans">
            <thead>
              <tr className="bg-gray-100 uppercase text-[9px] tracking-wider text-center">
                <th className="border border-black py-2 px-3 text-left w-2/3">{t.tblHeaderDesc}</th>
                <th className="border border-black py-2 px-3 text-right w-1/3">{t.tblHeaderAmount}</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              <tr>
                <td className="border border-black py-2 px-3 text-left">{t.totalIn}</td>
                <td className="border border-black py-2 px-3 text-right text-emerald-700 font-bold">{formatRupiah(totalLpjMasuk)}</td>
              </tr>
              <tr>
                <td className="border border-black py-2 px-3 text-left">{t.totalOut}</td>
                <td className="border border-black py-2 px-3 text-right text-rose-700 font-bold">({formatRupiah(totalLpjKeluar)})</td>
              </tr>
              <tr className="bg-gray-50 font-bold text-sm">
                <td className="border border-black py-2 px-3 text-left uppercase">{t.netBalance}</td>
                <td className="border border-black py-2 px-3 text-right text-blue-900 border-b-4 border-double border-black">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</td>
              </tr>
            </tbody>
          </table>

          {/* TABEL REKAP PER KATEGORI */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase border-b border-black pb-1 font-sans">{t.summarySect}</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Rekap Pemasukan */}
              <div>
                <table className="w-full text-left border-collapse border border-black text-[10px] font-sans">
                  <thead>
                    <tr className="bg-gray-50 font-bold uppercase text-[8px] border-b border-black">
                      <th className="py-1.5 px-2 border-r border-black">🟢 {t.summaryCat} (In)</th>
                      <th className="py-1.5 px-2 text-right">{t.summaryTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(rekapKategoriMasuk).map((key, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-1.5 px-2 uppercase border-r border-black font-medium">{key}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-emerald-700 font-bold">{formatRupiah(rekapKategoriMasuk[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rekap Pengeluaran */}
              <div>
                <table className="w-full text-left border-collapse border border-black text-[10px] font-sans">
                  <thead>
                    <tr className="bg-gray-50 font-bold uppercase text-[8px] border-b border-black">
                      <th className="py-1.5 px-2 border-r border-black">🔴 {t.summaryCat} (Out)</th>
                      <th className="py-1.5 px-2 text-right">{t.summaryTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(rekapKategoriKeluar).map((key, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-1.5 px-2 uppercase border-r border-black font-medium">{key}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-bold">{formatRupiah(rekapKategoriKeluar[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <p className="text-[9px] text-gray-400 font-sans italic mt-8 text-center">
            * Detail mutasi lengkap arus kas per tanggal dilampirkan pada halaman berikutnya.
          </p>
        </div>


        {/* ==================== HALAMAN 2: LAMPIRAN RINCIAN DATA ==================== */}
        <div className="page-break print-page-wrapper">
          <h2 className="text-center font-sans font-bold text-xs uppercase underline tracking-wider mb-4">LAMPIRAN MUTASI PEMBUKUAN ALIRAN KAS</h2>
          
          <div className="space-y-6">
            {/* TABEL RINCIAN MASUK */}
            <div>
              <h3 className="font-bold text-[10px] uppercase mb-1 font-sans border-b border-black pb-0.5">{t.sectIn}</h3>
              <table className="w-full text-left border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="border-b border-black bg-gray-50 font-bold uppercase text-[8px]">
                    <th className="border border-black py-1 px-1.5 w-20 text-center">{t.thDate}</th>
                    <th className="border border-black py-1 px-1.5 w-28">{t.thCat}</th>
                    <th className="border border-black py-1 px-1.5">{t.thLpjDesc}</th>
                    <th className="border border-black py-1 px-1.5 text-right w-28">{t.thAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTransaksiFinal.filter(x => x.aliranJenis === 'Masuk').map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="border border-black py-1 px-1.5 font-mono text-center text-gray-700">{t.transaction_date}</td>
                      <td className="border border-black py-1 px-1.5 uppercase text-gray-700 font-sans">{t.category}</td>
                      <td className="border border-black py-1 px-1.5 uppercase font-sans text-gray-900 tracking-wide">{t.uraian}</td>
                      <td className="border border-black py-1 px-1.5 text-right font-mono font-bold text-emerald-700">{formatRupiah(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABEL RINCIAN KELUAR */}
            <div>
              <h3 className="font-bold text-[10px] uppercase mb-1 font-sans border-b border-black pb-0.5">{t.sectOut}</h3>
              <table className="w-full text-left border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="border-b border-black bg-gray-50 font-bold uppercase text-[8px]">
                    <th className="border border-black py-1 px-1.5 w-20 text-center">{t.thDate}</th>
                    <th className="border border-black py-1.5 px-1.5 w-28">{t.thCat}</th>
                    <th className="border border-black py-1.5 px-1.5">{t.thLpjDesc}</th>
                    <th className="border border-black py-1.5 px-1.5 text-right w-28">{t.thAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTransaksiFinal.filter(x => x.aliranJenis === 'Keluar').map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="border border-black py-1.5 px-1.5 font-mono text-center text-gray-700">{t.transaction_date}</td>
                      <td className="border border-black py-1.5 px-1.5 uppercase text-gray-700 font-sans">{t.category}</td>
                      <td className="border border-black py-1.5 px-1.5 uppercase font-sans text-gray-900 tracking-wide">{t.uraian}</td>
                      <td className="border border-black py-1.5 px-1.5 text-right font-mono font-bold text-rose-700">{formatRupiah(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validasi Tanda Tangan */}
          <div className="mt-10 break-inside-avoid">
            <p className="text-right text-[10px] text-gray-700 italic mb-10 font-sans">
              {t.city}, {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-8 text-center text-[10px] font-sans">
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signKnow}<br />{t.signChair}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.ketua}</p>
                <p className="text-[8px] text-gray-500 font-medium mt-0.5">{t.signGroup}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signMade}<br />{t.signTreasurer}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.bendahara}</p>
                <p className="text-[8px] text-gray-500 font-medium mt-0.5">{t.signGroup}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
