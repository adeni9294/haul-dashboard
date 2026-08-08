'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '@/components/GlassCard';
import { 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Lock, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Loader2,
  DollarSign,
  ShieldAlert
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// KAMUS MULTI-BAHASA
const translations = {
  id: {
    title: "Buku Kas & Transaksi Haul",
    subtitle: "● Murni Grouping pertanggal & Integrasi Kas Keluar Aktif",
    btnTambah: "Tambah Kas",
    btnExcel: "Excel Data",
    btnCetak: "Cetak LPJ",
    btnTutupBuku: "Tutup Buku Periode",
    searchPlaceholder: "Cari uraian keterangan...",
    allCash: "Semua Aliran Kas",
    onlyIn: "Hanya Kas Masuk",
    onlyOut: "Hanya Kas Keluar",
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
    signChair: "Ketua",
    signMade: "Dibuat Oleh,",
    signTreasurer: "Bendahara",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    summarySect: "IKHTISAR REKAP TOTAL PER KATEGORI POS KAS",
    summaryCat: "Kategori Pos Anggaran",
    summaryTotal: "Total Realisasi Dana",
    selectPeriod: "PERIODE HAUL:",
    statusClosed: "(Tutup Buku)",
    statusActive: "(Aktif)"
  },
  jv: { 
    title: "Buku Kas & Transaksi Haul",
    subtitle: "● Murni Grouping pertanggal & Integrasi Kas Keluar Aktif",
    btnTambah: "Tambah Kas",
    btnExcel: "Pragat Excel",
    btnCetak: "Cetak LPJ",
    btnTutupBuku: "Tutup Buku Periode",
    searchPlaceholder: "Goleki keterangan...",
    allCash: "Kabeh Aliran Kas",
    onlyIn: "Pragat Mlebu Tok",
    onlyOut: "Pragat Blonjo Tok",
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
    signChair: "Ketua",
    signMade: "Sing Gawe,",
    signTreasurer: "Bendahara",
    signGroup: "PANITIA HAUL 2026",
    city: "Cirebon",
    summarySect: "IKHTISAR REKAP TOTAL PER KATEGORI POS KAS",
    summaryCat: "Kategori Pos Anggaran",
    summaryTotal: "Total Realisasi Dana",
    selectPeriod: "PERIODE HAUL:",
    statusClosed: "(Rampung)",
    statusActive: "(Mlaku)"
  },
  en: {
    title: "Cash Book & Haul Transactions",
    subtitle: "● Pure daily grouping & Active cash outflow integration",
    btnTambah: "Add Cash",
    btnExcel: "Export Excel",
    btnCetak: "Print Report",
    btnTutupBuku: "Close Accounting Period",
    searchPlaceholder: "Search description...",
    allCash: "All Cash Flows",
    onlyIn: "Cash Inflow Only",
    onlyOut: "Cash Outflow Only",
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
    summaryTotal: "Total Realized Funds",
    selectPeriod: "HAUL PERIOD:",
    statusClosed: "(Closed)",
    statusActive: "(Active)"
  }
};

export default function TransaksiPage() {
  const [lang, setLang] = useState('id');
  const t = translations[lang] || translations['id'];

  const [loading, setLoading] = useState(true);
  const [allDonations, setAllDonations] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // STATE NOTIFIKASI TOAST
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // STATE MODAL KONFIRMASI HAPUS
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, isExpenses: false });
  
  // State Periode Haul
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null);
  const [currentPeriodeObj, setCurrentPeriodeObj] = useState(null);
  
  // Modal Tutup Buku
  const [showModalTutupBuku, setShowModalTutupBuku] = useState(false);
  const [namaPeriodeBaruInput, setNamaPeriodeBaruInput] = useState('');

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  useEffect(() => {
    checkAdminSessionAndLoad();
    loadData();

    const interval = setInterval(checkAdminSessionOnly, 1000);
    return () => clearInterval(interval);
  }, [selectedPeriodeId]);

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

      let activePeriodeId = selectedPeriodeId;
      const { data: listPeriode } = await supabase
        .from('periode_haul')
        .select('*')
        .order('created_at', { ascending: false });

      if (listPeriode && listPeriode.length > 0) {
        setPeriodeList(listPeriode);
        if (!activePeriodeId) {
          activePeriodeId = listPeriode[0].id;
          setSelectedPeriodeId(activePeriodeId);
        }
        const found = listPeriode.find(p => p.id === activePeriodeId) || listPeriode[0];
        setCurrentPeriodeObj(found);
      }
      
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

      let donQuery = supabase.from('donation_details').select('*');
      let expQuery = supabase.from('transactions').select('*');

      if (activePeriodeId) {
        donQuery = donQuery.eq('periode_id', activePeriodeId);
        expQuery = expQuery.eq('periode_id', activePeriodeId);
      }

      const { data: donationsDb } = await donQuery;
      const { data: expensesDb } = await expQuery;
        
      setAllDonations(donationsDb || []);
      setAllExpenses(expensesDb || []);
    } catch (e) {
      console.error("Gagal load data: ", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (currentPeriodeObj?.is_closed) {
      showToast('Periode ini telah ditutup buku. Tidak dapat menambah/mengubah data.', 'warning');
      return;
    }
    
    const cleanAmount = parseFloat(formAmount.toString().replace(/[^0-9.-]/g, '')) || 0;
    if (cleanAmount <= 0) return;

    const finalCategory = formCategory || (categories.length > 0 ? categories[0].name : 'Lain-lain');
    
    const payload = {
      transaction_date: formDate,
      type: formType === 'Pengeluaran' ? 'keluar' : 'masuk',
      category: finalCategory,
      note: formDescription.trim(),
      amount: cleanAmount,
      periode_id: selectedPeriodeId
    };

    try {
      if (isEditMode) {
        await supabase.from('transactions').update(payload).eq('id', selectedId);
        showToast('Transaksi berhasil diperbarui.', 'success');
      } else {
        await supabase.from('transactions').insert([payload]);
        showToast('Transaksi baru berhasil ditambahkan.', 'success');
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi.', 'error');
    }
  };

  const handleProsesTutupBuku = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedPeriodeId) return;
    if (!namaPeriodeBaruInput.trim()) {
      showToast('Harap isi nama periode baru!', 'warning');
      return;
    }

    try {
      const { error } = await supabase.rpc('proses_tutup_buku', {
        p_periode_id_lama: selectedPeriodeId,
        p_nama_periode_baru: namaPeriodeBaruInput.trim()
      });

      if (error) throw error;

      showToast('Tutup Buku Berhasil! Periode baru otomatis terbentuk.', 'success');
      setShowModalTutupBuku(false);
      setNamaPeriodeBaruInput('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      showToast(`Gagal Tutup Buku: ${err.message}`, 'error');
    }
  };

  const triggerEdit = (item) => {
    if (currentPeriodeObj?.is_closed) {
      showToast('Periode ini sudah ditutup buku dan bersifat Read-Only!', 'warning');
      return;
    }
    setSelectedId(item.id);
    setIsEditMode(true);
    setFormDate(item.transaction_date);
    setFormType(item.aliranJenis === 'Keluar' ? 'Pengeluaran' : 'Pemasukan');
    setFormCategory(item.category);
    setFormDescription(item.uraian);
    setFormAmount(item.amount);
    setShowModal(true);
  };

  const triggerHapus = (id, isFromExpenses) => {
    if (!isAdmin) return;
    if (currentPeriodeObj?.is_closed) {
      showToast('Periode ini telah ditutup buku!', 'warning');
      return;
    }
    setDeleteConfirm({ show: true, id, isExpenses: isFromExpenses });
  };

  const executeDelete = async () => {
    const { id, isExpenses } = deleteConfirm;
    setDeleteConfirm({ show: false, id: null, isExpenses: false });
    try {
      const targetTable = isExpenses ? 'transactions' : 'donation_details';
      const { error } = await supabase.from(targetTable).delete().eq('id', id);
      if (error) throw error;
      showToast('Catatan berhasil dihapus.', 'success');
      await loadData();
    } catch (err) {
      showToast(`Gagal hapus: ${err.message}`, 'error');
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
      showToast('Berhasil mengunduh file Excel/CSV.', 'success');
    } catch (err) {
      showToast('Gagal mengekspor data: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-xs font-mono theme-text-primary">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="font-bold">{t.syncData}</span>
      </div>
    );
  }

  return (
    <div id="root-transaksi-container" className="space-y-4 max-w-7xl mx-auto px-1 sm:px-0 pb-12 text-xs theme-text-primary relative font-sans">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] print:hidden animate-in fade-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl border-2 ${
            toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200' :
            toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/80 text-rose-200' :
            toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/80 text-amber-200' :
            'bg-slate-900/90 border-slate-700 text-white'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
              <span className="font-bold text-xs leading-snug truncate">{toast.message}</span>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer">
              <X className="w-4 h-4 opacity-80 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DIALOG KONFIRMASI HAPUS */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <GlassCard className="max-w-sm w-full text-center space-y-4 p-6 shadow-2xl border theme-border">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm uppercase theme-text-primary">Konfirmasi Hapus</h3>
            <p className="text-xs theme-text-secondary leading-relaxed font-semibold">Apakah Anda yakin ingin menghapus catatan transaksi internal ini secara permanen?</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeleteConfirm({ show: false, id: null, isExpenses: false })} className="flex-1 py-2.5 theme-bg-tertiary hover:bg-black/50 theme-text-secondary font-bold rounded-xl text-xs border theme-border cursor-pointer">Batal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase shadow-lg cursor-pointer">Hapus</button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PRINT STYLES UNTUK LPJ PROFESIONAL */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          html, body, main, #root-transaksi-container {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }

          .print\\:hidden, nav, header, sidebar, button, .lucide {
            display: none !important;
          }

          .hidden.print\\:block {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
          }

          .cetak-wrapper-logo, .cetak-wrapper-logo img {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page-wrapper {
            background: white !important;
            color: black !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* AREA UTAMA INTERFACE */}
      <div className="print:hidden space-y-4">
        
        {/* HEADER & TOP CONTROLS */}
        <GlassCard className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {t.title}
              </h2>
              {isAdmin ? (
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full font-mono uppercase">
                  ADMIN
                </span>
              ) : (
                <span className="bg-rose-500/20 border border-rose-400/40 text-rose-400 text-[9px] font-black px-2 py-0.5 rounded-full font-mono uppercase">
                  PUBLIC
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono mt-0.5 theme-text-secondary font-semibold">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {periodeList.length > 0 && (
              <div className="flex items-center theme-bg-tertiary p-1 border theme-border rounded-xl mr-1">
                <span className="text-[9px] font-mono font-bold theme-text-secondary px-2 uppercase">{t.selectPeriod}</span>
                <select
                  value={selectedPeriodeId || ''}
                  onChange={(e) => setSelectedPeriodeId(Number(e.target.value))}
                  className="theme-bg-secondary border theme-border text-[10px] theme-text-accent rounded-lg px-2 py-1 font-mono font-bold cursor-pointer focus:outline-none"
                >
                  {periodeList.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">
                      {p.nama_periode} {p.is_closed ? t.statusClosed : t.statusActive}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex theme-bg-tertiary p-1 border theme-border rounded-xl mr-1">
              <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all cursor-pointer ${lang === 'id' ? 'bg-[#BFEC25] text-black' : 'theme-text-secondary'}`}>ID 🇮🇩</button>
              <button onClick={() => setLang('jv')} className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all cursor-pointer ${lang === 'jv' ? 'bg-[#BFEC25] text-black' : 'theme-text-secondary'}`}>JV 🎯</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all cursor-pointer ${lang === 'en' ? 'bg-[#BFEC25] text-black' : 'theme-text-secondary'}`}>EN 🇬🇧</button>
            </div>

            {isAdmin && currentPeriodeObj && !currentPeriodeObj.is_closed && (
              <button 
                onClick={() => setShowModalTutupBuku(true)} 
                className="flex-1 sm:flex-initial px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase rounded-xl shadow-md transition-all text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.btnTutupBuku}</span>
              </button>
            )}

            {isAdmin && !currentPeriodeObj?.is_closed && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-initial px-4 py-2 btn-theme-primary font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>{t.btnTambah}</span>
              </button>
            )}
            
            <button onClick={handleExportExcelManual} className="flex-1 sm:flex-initial px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.btnExcel}</span>
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-initial px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase rounded-xl shadow-md text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>{t.btnCetak}</span>
            </button>
          </div>
        </GlassCard>

        {currentPeriodeObj?.is_closed && (
          <GlassCard className="p-3 border-amber-500/40 flex items-center justify-between text-amber-400 font-mono text-xs">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Periode <strong>{currentPeriodeObj.nama_periode}</strong> telah ditutup buku pada {currentPeriodeObj.tanggal_selesai}. Data bersifat Read-Only.</span>
            </span>
            <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">Arsip</span>
          </GlassCard>
        )}

        <GlassCard className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 theme-text-tertiary" />
            <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none theme-text-primary placeholder:theme-text-tertiary text-xs font-semibold" />
          </div>
          
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 absolute left-3 theme-text-tertiary" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 theme-bg-tertiary border theme-border rounded-xl theme-text-primary focus:outline-none cursor-pointer font-bold text-xs">
              <option value="all" className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">{t.allCash}</option>
              <option value="masuk" className="bg-slate-900 text-emerald-400 dark:bg-slate-900 dark:text-emerald-400">{t.onlyIn}</option>
              <option value="keluar" className="bg-slate-900 text-rose-400 dark:bg-slate-900 dark:text-rose-400">{t.onlyOut}</option>
            </select>
          </div>

          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl theme-text-primary focus:outline-none cursor-pointer font-bold text-xs">
            <option value="all" className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">{t.allCat}</option>
            {categories.map((c, i) => <option key={i} value={c.name} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">{c.name}</option>)}
          </select>
        </GlassCard>

        <GlassCard className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto shadow-xl relative scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="theme-bg-tertiary theme-text-primary border-b theme-border font-mono uppercase text-[10px] font-bold tracking-wider sticky top-0 z-20 backdrop-blur-md">
                <th className="p-3 w-24">{t.thDate}</th>
                <th className="p-3 w-28">{t.thCat}</th>
                <th className="p-3">{t.thDesc}</th>
                <th className="p-3 text-right w-32">{t.thAmount}</th>
                {isAdmin && <th className="p-3 text-center w-36">{t.thAction}</th>}
              </tr>
            </thead>
            <tbody className="divide-y theme-border theme-text-primary">
              {filteredTrans.map((tItem, idx) => {
                const isKeluar = tItem.aliranJenis === 'Keluar';
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-all">
                    <td className="p-3 font-mono theme-text-secondary font-bold text-[10px] whitespace-nowrap">{tItem.transaction_date}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 border rounded-full font-mono text-[9px] uppercase font-black inline-flex items-center gap-1 ${!isKeluar ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400' : 'bg-rose-500/20 border-rose-400/40 text-rose-400'}`}>
                        {!isKeluar ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tItem.category}
                      </span> 
                    </td>
                    <td className="p-3 font-bold text-[11px] sm:text-xs uppercase tracking-wide theme-text-primary">
                      {tItem.uraian}
                    </td>
                    <td className={`p-3 text-right font-mono font-black whitespace-nowrap ${!isKeluar ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {!isKeluar ? '+' : '-'}{formatRupiah(tItem.amount)}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center space-x-2 font-mono whitespace-nowrap">
                        {currentPeriodeObj?.is_closed ? (
                          <span className="theme-text-accent italic font-bold text-[10px] flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Terkunci
                          </span>
                        ) : tItem.isSystem ? (
                          <div className="flex items-center justify-center gap-1">
                            {tItem.isFromExpenses && (
                              <button type="button" onClick={() => triggerEdit(tItem)} className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors cursor-pointer" title="Edit">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button type="button" onClick={() => triggerHapus(tItem.id, tItem.isFromExpenses)} className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="theme-text-secondary italic font-semibold text-[10px]">🔒 Terkunci Privasi</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredTrans.length === 0 && (
                <tr><td colSpan={isAdmin ? 5 : 4} className="p-6 text-center theme-text-secondary font-mono font-bold">{t.noData}</td></tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* MODAL TUTUP BUKU */}
      {showModalTutupBuku && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <GlassCard className="p-6 w-full max-w-md space-y-4 shadow-2xl border theme-border">
            <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Konfirmasi Tutup Buku Periode</span>
            </h3>
            <p className="text-xs theme-text-secondary leading-relaxed font-semibold">
              Proses ini akan mengunci seluruh transaksi di <strong>{currentPeriodeObj?.nama_periode}</strong> dan membentuk Saldo Kas Akhir sebesar <strong className="text-emerald-400">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</strong> menjadi Saldo Kas Awal periode baru.
            </p>
            <form onSubmit={handleProsesTutupBuku} className="space-y-4">
              <div>
                <label className="block theme-text-secondary mb-1 text-[11px] font-bold">Nama Periode Baru</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Haul 2027" 
                  required 
                  value={namaPeriodeBaruInput} 
                  onChange={e => setNamaPeriodeBaruInput(e.target.value)} 
                  className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none font-bold theme-text-accent text-xs" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModalTutupBuku(false)} className="flex-1 py-2.5 theme-bg-tertiary border theme-border theme-text-secondary font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl shadow-lg text-xs cursor-pointer">Eksekusi Tutup Buku</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* REGISTRASI MODAL INPUT TRANSAKSI */}
      {showModal && isAdmin && !currentPeriodeObj?.is_closed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <GlassCard className="p-6 w-full max-w-md space-y-4 shadow-2xl border theme-border">
            <h3 className="text-sm font-black uppercase tracking-wider theme-text-accent flex items-center gap-2">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
              <span>{isEditMode ? 'Ubah Catatan Operasional' : 'Registrasi Catatan Kas Baru'}</span>
            </h3>
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block theme-text-secondary mb-1 font-bold text-[11px]">Tanggal</label>
                  <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none text-center font-mono theme-text-primary text-xs font-bold" />
                </div>
                <div>
                  <label className="block theme-text-secondary mb-1 font-bold text-[11px]">Aliran Jenis</label>
                  <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none theme-text-primary cursor-pointer text-xs font-bold">
                    <option value="Pengeluaran" className="bg-slate-900 text-rose-400 dark:bg-slate-900 dark:text-rose-400">Pengeluaran (Merah)</option>
                    <option value="Pemasukan" className="bg-slate-900 text-emerald-400 dark:bg-slate-900 dark:text-emerald-400">Pemasukan (Hijau)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block theme-text-secondary mb-1 font-bold text-[11px]">Kategori Pos Buku Kas</label>
                <select required value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none theme-text-primary cursor-pointer text-xs font-bold">
                  {categories.map((c, i) => <option key={i} value={c.name} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block theme-text-secondary mb-1 font-bold text-[11px]">Nominal Rupiah</label>
                <input type="number" placeholder="Contoh: 500000" required value={formAmount} onChange={e => setFormAmount(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none font-mono text-right font-black theme-text-accent text-sm" />
              </div>
              <div>
                <label className="block theme-text-secondary mb-1 font-bold text-[11px]">Uraian Keterangan</label>
                <input type="text" placeholder="Misal: DP Sound System" required value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 theme-bg-tertiary border theme-border rounded-xl focus:outline-none theme-text-primary text-xs font-bold" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 theme-bg-tertiary border theme-border theme-text-secondary font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 btn-theme-primary font-black uppercase rounded-xl shadow-lg text-xs cursor-pointer">Simpan Kas</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* AREA CETAK LPJ PROFESIONAL (FORMAL A4 PRINT OUT ONLY) */}
      <div className="hidden print:block bg-white text-black p-0 font-serif text-[11px] leading-relaxed w-full">
        <div className="print-page-wrapper">
          
          {/* KOP SURAT FORMAL */}
          <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-4">
            <div className="cetak-wrapper-logo w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img 
                src={`${supabaseUrl}/storage/v1/object/public/logos/logo_system.png`}
                alt="Logo Resmi" 
                className="w-16 h-16 object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg font-bold uppercase font-sans tracking-wide leading-tight">{metaOrg.name}</h1>
              <p className="text-[9px] font-sans italic text-gray-700 mt-0.5">{metaOrg.address}</p>
            </div>
            <div className="w-16 h-16 flex-shrink-0"></div>
          </div>
          
          <div className="text-center mb-5">
            <h2 className="text-sm font-bold uppercase underline tracking-widest font-sans">{t.lpjTitle}</h2>
            <p className="text-[9px] text-gray-600 mt-0.5">{t.lpjPeriod} {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* TABEL 1: RINGKASAN UTAMA (IKHTISAR SALDO) */}
          <table className="w-full border-collapse border-2 border-black text-[11px] mb-5 font-sans">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-black uppercase text-[10px] tracking-wider text-center font-bold">
                <th className="border-r-2 border-black py-2 px-3 text-left w-2/3">{t.tblHeaderDesc}</th>
                <th className="py-2 px-3 text-right w-1/3">{t.tblHeaderAmount}</th>
              </tr>
            </thead>
            <tbody className="font-medium divide-y divide-black">
              <tr className="border-b border-black">
                <td className="border-r border-black py-2 px-3 text-left">{t.totalIn}</td>
                <td className="py-2 px-3 text-right text-emerald-900 font-bold font-mono">{formatRupiah(totalLpjMasuk)}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black py-2 px-3 text-left">{t.totalOut}</td>
                <td className="py-2 px-3 text-right text-rose-900 font-bold font-mono">({formatRupiah(totalLpjKeluar)})</td>
              </tr>
              <tr className="bg-gray-100 font-bold text-sm">
                <td className="border-r-2 border-black py-2 px-3 text-left uppercase">{t.netBalance}</td>
                <td className="py-2 px-3 text-right text-blue-900 font-mono border-t-2 border-black">{formatRupiah(totalLpjMasuk - totalLpjKeluar)}</td>
              </tr>
            </tbody>
          </table>

          {/* TABEL 2: REKAPITULASI TOTAL PER KATEGORI POS */}
          <div className="space-y-2 mb-6">
            <h3 className="font-bold text-xs uppercase border-b-2 border-black pb-1 font-sans">{t.summarySect}</h3>
            <div className="grid grid-cols-2 gap-4">
              
              {/* POS PEMASUKAN */}
              <div>
                <table className="w-full text-left border-collapse border-2 border-black text-[10px] font-sans">
                  <thead>
                    <tr className="bg-gray-200 font-bold uppercase text-[8px] border-b-2 border-black">
                      <th className="py-1.5 px-2 border-r border-black">{t.summaryCat} (In)</th>
                      <th className="py-1.5 px-2 text-right">{t.summaryTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(rekapKategoriMasuk).map((key, idx) => (
                      <tr key={idx} className="border-b border-black">
                        <td className="py-1 px-2 uppercase border-r border-black font-medium">{key}</td>
                        <td className="py-1 px-2 text-right font-mono text-emerald-900 font-bold">{formatRupiah(rekapKategoriMasuk[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* POS PENGELUARAN */}
              <div>
                <table className="w-full text-left border-collapse border-2 border-black text-[10px] font-sans">
                  <thead>
                    <tr className="bg-gray-200 font-bold uppercase text-[8px] border-b-2 border-black">
                      <th className="py-1.5 px-2 border-r border-black">{t.summaryCat} (Out)</th>
                      <th className="py-1.5 px-2 text-right">{t.summaryTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(rekapKategoriKeluar).map((key, idx) => (
                      <tr key={idx} className="border-b border-black">
                        <td className="py-1 px-2 uppercase border-r border-black font-medium">{key}</td>
                        <td className="py-1 px-2 text-right font-mono text-rose-900 font-bold">{formatRupiah(rekapKategoriKeluar[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          
          {/* TABEL MUTASI RINCIAN PEMASUKAN & PENGELUARAN LENGKAP */}
          <div className="space-y-5 pt-2">
            <h2 className="text-center font-sans font-bold text-xs uppercase underline tracking-wider">LAMPIRAN MUTASI PEMBUKUAN ALIRAN KAS</h2>
            
            {/* TABEL MUTASI KAS MASUK */}
            <div>
              <h3 className="font-bold text-[10px] uppercase mb-1 font-sans border-b border-black pb-0.5">{t.sectIn}</h3>
              <table className="w-full text-left border-collapse border-2 border-black text-[9px]">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-200 font-bold uppercase text-[8px]">
                    <th className="border-r border-black py-1.5 px-1.5 w-20 text-center">{t.thDate}</th>
                    <th className="border-r border-black py-1.5 px-1.5 w-28">{t.thCat}</th>
                    <th className="border-r border-black py-1.5 px-1.5">{t.thLpjDesc}</th>
                    <th className="py-1.5 px-1.5 text-right w-28">{t.thAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTransaksiFinal.filter(x => x.aliranJenis === 'Masuk').map((tItem, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black py-1 px-1.5 font-mono text-center text-gray-800">{tItem.transaction_date}</td>
                      <td className="border-r border-black py-1 px-1.5 uppercase text-gray-800 font-sans">{tItem.category}</td>
                      <td className="border-r border-black py-1 px-1.5 uppercase font-sans text-gray-900 font-medium tracking-wide">{tItem.uraian}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-emerald-900">{formatRupiah(tItem.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABEL MUTASI KAS KELUAR */}
            <div>
              <h3 className="font-bold text-[10px] uppercase mb-1 font-sans border-b border-black pb-0.5">{t.sectOut}</h3>
              <table className="w-full text-left border-collapse border-2 border-black text-[9px]">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-200 font-bold uppercase text-[8px]">
                    <th className="border-r border-black py-1.5 px-1.5 w-20 text-center">{t.thDate}</th>
                    <th className="border-r border-black py-1.5 px-1.5 w-28">{t.thCat}</th>
                    <th className="border-r border-black py-1.5 px-1.5">{t.thLpjDesc}</th>
                    <th className="py-1.5 px-1.5 text-right w-28">{t.thAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTransaksiFinal.filter(x => x.aliranJenis === 'Keluar').map((tItem, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black py-1 px-1.5 font-mono text-center text-gray-800">{tItem.transaction_date}</td>
                      <td className="border-r border-black py-1 px-1.5 uppercase text-gray-800 font-sans">{tItem.category}</td>
                      <td className="border-r border-black py-1 px-1.5 uppercase font-sans text-gray-900 font-medium tracking-wide">{tItem.uraian}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-rose-900">{formatRupiah(tItem.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* AREA TANDA TANGAN FORMAL */}
          <div className="mt-8 break-inside-avoid">
            <p className="text-right text-[10px] text-gray-800 italic mb-8 font-sans">
              {t.city}, {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : lang === 'jv' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-8 text-center text-[10px] font-sans">
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signKnow}<br />{t.signChair}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.ketua}</p>
                <p className="text-[8px] text-gray-600 font-medium mt-0.5">{t.signGroup}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider mb-14 text-gray-800">{t.signMade}<br />{t.signTreasurer}</p>
                <p className="font-bold underline uppercase text-black">{metaOrg.bendahara}</p>
                <p className="text-[8px] text-gray-600 font-medium mt-0.5">{t.signGroup}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
